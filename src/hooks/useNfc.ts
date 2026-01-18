import { useEffect, useState, useCallback } from "react";
import NfcManager, { NfcTech, Ndef, NfcEvents } from "react-native-nfc-manager";
import { Platform } from "react-native";

const WEB_DOMAIN = process.env.EXPO_PUBLIC_WEB_DOMAIN || "localhost:8081";

export function generateSurveyUrl(surveyId: string, response: "yes" | "no"): string {
  return `https://${WEB_DOMAIN}/survey/${surveyId}/${response}`;
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
        const payload = Ndef.text.decodePayload(
          new Uint8Array(ndefRecord.payload)
        );

        if (payload) {
          return parseSurveyUrl(payload);
        }

        const uriPayload = Ndef.uri.decodePayload(
          new Uint8Array(ndefRecord.payload)
        );
        if (uriPayload) {
          return parseSurveyUrl(uriPayload);
        }
      }

      return null;
    } finally {
      setIsReading(false);
      await NfcManager.cancelTechnologyRequest();
    }
  }, [status, parseSurveyUrl]);

  const writeTag = useCallback(
    async (surveyId: string, response: "yes" | "no"): Promise<boolean> => {
      if (!status.isSupported || !status.isEnabled) {
        throw new Error("NFC is not available");
      }

      const url = generateSurveyUrl(surveyId, response);

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);

        if (bytes) {
          await NfcManager.ndefHandler.writeNdefMessage(bytes);
          return true;
        }

        return false;
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
