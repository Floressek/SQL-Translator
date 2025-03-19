export const EXAMPLE_USER_QUERY =
  'Przygotuj szczegółowy raport o aktywnych kontrahentach będących firmami, z ich opiekunami, danymi kontaktowymi, informacjami o e-fakturach, statusie VAT, przypisanych rabatach i komunikatach, którzy zostali dodani lub zmodyfikowani w ciągu ostatnich 6 miesięcy, posiadający alternatywne adresy lub e-faktury, posortowani według daty modyfikacji i nazwiska opiekuna';

export const EXAMPLE_FORMATTED_ANSWER =
  'W roku 2024 sprzedano 4281 sztuk listwy startowej wentylacyjnej D-MATT 9005.';

export const EXAMPLE_SQL_STATEMENT =
  "SELECT TOP 100 k.kh_Id, k.kh_Symbol, k.kh_Kontakt, k.kh_EMail, k.kh_\n" +
  "WWW, k.kh_EFakturyZgoda, k.kh_CzynnyPodatnikVAT, k.kh_ZgodaMark, k.kh_ZgodaEMail, k.kh_AdresKoresp, k.kh_AdresDostawy, k.kh_CzyKomunikat, k.kh_Kom\n" +
  "unikat, u.uz_Nazwisko AS OpiekunNazwisko, r.rt_Nazwa AS RabatNazwa, k.kh_DataDodania, k.kh_DataZmiany FROM kh__Kontrahent k LEFT JOIN pd_Uzytkowni\n" +
  "k u ON k.kh_IdOpiekun = u.uz_Id LEFT JOIN sl_Rabat r ON k.kh_IdRabat = r.rt_Id WHERE k.kh_Osoba = 0 AND k.kh_Zablokowany = 0 AND (k.kh_DataDodania\n" +
  " >= DATEADD(month, -6, GETDATE()) OR k.kh_DataZmiany >= DATEADD(month, -6, GETDATE())) AND (k.kh_AdresKoresp = 1 OR k.kh_AdresDostawy = 1 OR k.kh_EFakturyZgoda = 1) ORDER BY k.kh_DataZmiany DESC, u.uz_Nazwisko;";


export const EXAMPLE_ROW_DATA_ARRAY = [
  {
    handlowiec: 'Nowak Mciej (563)',
    total_profit: '125443.9240700',
  },
  {
    handlowiec: 'Roman Kot (456)',
    total_profit: '5523441854.8967300',
  },
  {
    handlowiec: 'Kowalski Piotr (453)',
    total_profit: '480234345.9563100',
  },
];
