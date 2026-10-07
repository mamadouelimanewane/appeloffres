export function genererIcs(titre: string, dateStr: string, description: string, url: string) {
  const dt = dateStr.replace(/-/g, "");
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:${dt}
DTEND;VALUE=DATE:${dt}
SUMMARY:${titre}
DESCRIPTION:${description}\\n\\n${url}
END:VEVENT
END:VCALENDAR`;
}

export function telechargerIcs(ics: string, nomFichier: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
