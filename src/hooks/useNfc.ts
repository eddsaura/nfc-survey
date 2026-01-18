import { useCallback, useEffect, useState } from "react";
import NfcManager, { Ndef, NfcEvents, NfcTech } from "react-native-nfc-manager";

const WEB_DOMAIN = process.env.EXPO_PUBLIC_WEB_DOMAIN || "localhost:8081";

export function generateSurveyUrl(surveyId: string, response: "yes" | "no"): string {
  return `${WEB_DOMAIN}/survey/${surveyId}/${response}`;
}

export interface NfcStatus {
  isSupported: boolean;
  isEnabled: boolean;
}

export interface ParsedSurveyUrl {
  surveyId: string;
  response: "yes" | "no";
}

export function useNfc() {
  const [status, setStatus] = useState<NfcStatus>({
    isSupported: false,
    isEnabled: false,
  });
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    async function initNfc() {
      try {
        const supported = await NfcManager.isSupported();
        if (supported) {
          await NfcManager.start();
          const enabled = await NfcManager.isEnabled();
          setStatus({ isSupported: true, isEnabled: enabled });
        } else {
          setStatus({ isSupported: false, isEnabled: false });
        }
      } catch (error) {
        console.error("NFC init error:", error);
        setStatus({ isSupported: false, isEnabled: false });
      }
    }

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.setEventListener(NfcEvents.SessionClosed, null);
    };
  }, []);

  const parseSurveyUrl = useCallback((url: string): ParsedSurveyUrl | null => {
    try {
      const patterns = [
        /nfcsurvey:\/\/survey\/([^/]+)\/(yes|no)/i,
        /https?:\/\/[^/]+\/survey\/([^/]+)\/(yes|no)/i,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            surveyId: match[1],
            response: match[2].toLowerCase() as "yes" | "no",
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const readTag = useCallback(async (): Promise<ParsedSurveyUrl | null> => {
    if (!status.isSupported || !status.isEnabled) {
      throw new Error("NFC is not available");
    }

    setIsReading(true);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];

        // Try URI decoding first (since we write URI records)
        const uriPayload = Ndef.uri.decodePayload(
          new Uint8Array(ndefRecord.payload)
        );
        if (uriPayload) {
          const result = parseSurveyUrl(uriPayload);
          if (result) {
            return result;
          }
        }

        // Fall back to text decoding
        const textPayload = Ndef.text.decodePayload(
          new Uint8Array(ndefRecord.payload)
        );
        if (textPayload) {
          const result = parseSurveyUrl(textPayload);
          if (result) {
            return result;
          }
        }
      }

      return null;
    } finally {
      setIsReading(false);
      await NfcManager.cancelTechnologyRequest();
    }
  }, [status, parseSurveyUrl]);

  const writeTag = useCallback(
    async (
      surveyId: string,
      response: "yes" | "no",
      lockAfterWrite: boolean = false
    ): Promise<{ success: boolean; locked: boolean }> => {
      if (!status.isSupported || !status.isEnabled) {
        throw new Error("NFC is not available");
      }

      const url = generateSurveyUrl(surveyId, response);

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);

        if (bytes) {
          await NfcManager.ndefHandler.writeNdefMessage(bytes);

          let locked = false;
          if (lockAfterWrite) {
            try {
              await NfcManager.ndefHandler.makeReadOnly();
              locked = true;
            } catch (lockError) {
              console.warn("Failed to lock tag:", lockError);
              // Write succeeded but lock failed - still return success
            }
          }

          return { success: true, locked };
        }

        return { success: false, locked: false };
      } finally {
        await NfcManager.cancelTechnologyRequest();
      }
    },
    [status]
  );

  const cancelRead = useCallback(async () => {
    setIsReading(false);
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // Ignore errors when canceling
    }
  }, []);

  return {
    status,
    isReading,
    readTag,
    writeTag,
    cancelRead,
    parseSurveyUrl,
  };
}
