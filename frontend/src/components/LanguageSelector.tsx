import { Container, Text, FormLabel, Stack } from "@chakra-ui/react";
import Flag from "react-flagkit";
import Select, { OnChangeValue } from "react-select";

interface LanguageOption {
  /**
   * language in ISO 639-1 format
   * https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
   */
  value: string;
  /**
   * NOTE: This gets overriden with a React Component at runtime
   * property name 'label' is required on react-select
   */
  label: any;
  /**
   * NOTE: this also gets populated at runtime. basically a copy of the label string
   */
  labelString?: string;
  countryCode: string;
}

const languages: LanguageOption[] = [
  { value: "en", label: "English", countryCode: "US" },
  { value: "es", label: "Spanish", countryCode: "ES" },
  { value: "fr", label: "French", countryCode: "FR" },
  { value: "de", label: "German", countryCode: "DE" },
  { value: "it", label: "Italian", countryCode: "IT" },
  { value: "pt", label: "Portuguese", countryCode: "PT" },
  { value: "nl", label: "Dutch", countryCode: "NL" },
  { value: "ru", label: "Russian", countryCode: "RU" },
  {
    value: "zh",
    label: "Chinese (Simplified)",
    countryCode: "CN",
  },
  { value: "ja", label: "Japanese", countryCode: "JP" },
  { value: "ko", label: "Korean", countryCode: "KR" },
  { value: "ar", label: "Arabic", countryCode: "SA" },
  { value: "id", label: "Indonesian", countryCode: "ID" },
  { value: "tr", label: "Turkish", countryCode: "TR" },
  { value: "sv", label: "Swedish", countryCode: "SE" },
  { value: "no", label: "Norwegian", countryCode: "NO" },
  { value: "da", label: "Danish", countryCode: "DK" },
  { value: "pl", label: "Polish", countryCode: "PL" },
  { value: "fi", label: "Finnish", countryCode: "FI" },
  { value: "el", label: "Greek", countryCode: "GR" },
  { value: "cs", label: "Czech", countryCode: "CZ" },
  { value: "hu", label: "Hungarian", countryCode: "HU" },
  { value: "ro", label: "Romanian", countryCode: "RO" },
  { value: "sk", label: "Slovak", countryCode: "SK" },
  { value: "bg", label: "Bulgarian", countryCode: "BG" },
  { value: "hr", label: "Croatian", countryCode: "HR" },
  { value: "sr", label: "Serbian", countryCode: "RS" },
  { value: "sl", label: "Slovenian", countryCode: "SI" },
  { value: "lt", label: "Lithuanian", countryCode: "LT" },
  { value: "lv", label: "Latvian", countryCode: "LV" },
  { value: "et", label: "Estonian", countryCode: "EE" },
];

/**
 * Update the languages array so that we can have a custom option component
 */
const updatedLanguagesLabel = languages.map((language) => {
  language.labelString = language.label;
  language.label = (
    <Stack direction="row" justifyContent={"space-between"}>
      <Text color={"black"}>{language.label}</Text>
      <Flag country={language.countryCode} size={15} />
    </Stack>
  );
  return language;
});

interface LanguageSelectorProps {
  onChange: (newValue: OnChangeValue<LanguageOption, false>) => void;
  title: string;
  defaultIndex: number;
  disabled?: boolean;
}

/**
 * Language dropdown selector
 */
export const LanguageSelector = ({
  onChange,
  title,
  defaultIndex,
  disabled = false,
}: LanguageSelectorProps) => {
  return (
    <Container padding={0}>
      <FormLabel>{title}</FormLabel>
      <Select
        isDisabled={disabled}
        // @ts-ignore
        defaultValue={languages[defaultIndex]}
        onChange={onChange}
        // @ts-ignore
        options={updatedLanguagesLabel}
      />
    </Container>
  );
};
