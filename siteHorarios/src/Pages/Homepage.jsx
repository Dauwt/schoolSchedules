import { useEffect, useState } from "react";

// Import schedule JSON (put schedule.json in src/ folder)
import scheduleData from "../schedule.json";

import Header from '../Header.jsx'
import '../App.css'

// Utility: convert "HH:MM" to minutes since midnight
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Utility: get current Lisbon time
const getLisbonTime = () => {
  const now = new Date();
  const options = { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hour12: false };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(now);
  const hour = parts.find(p => p.type === "hour").value;
  const minute = parts.find(p => p.type === "minute").value;
  return `${hour}:${minute}`;
};

console.log(getLisbonTime())

function Homepage() {
  const [currentInfo, setCurrentInfo] = useState(null);
  const [showNextClasses, setShowNextClasses] = useState(false);

  useEffect(() => {
    const updateSchedule = () => {
      const now = "12:07" //getLisbonTime();
      const nowMinutes = toMinutes(now);

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const today = days[1] //new Date().getDay()];

      const todaySchedule = scheduleData.schedule[today] || [];

      // Find what matches current time
      const active = todaySchedule.filter((entry) => {
        if (entry.type === "break") return false;
        if (entry.type === "lunch") {
          return nowMinutes >= toMinutes(entry.start) && nowMinutes < toMinutes(entry.end);
        } else if (entry.type === "class") {
          return nowMinutes >= toMinutes(entry.start) && nowMinutes < toMinutes(entry.end);
        }
      });

      // Check if in a break
      let activeInfo;
      if (active.length > 0) {
        activeInfo = { type: "class", entries: active };
      } else {
        // Maybe in a break
        for (let i = 0; i < todaySchedule.length; i++) {
          const entry = todaySchedule[i];

          if (entry.type === "break") {
            // Breaks only have duration, so find before & after
            const prev = todaySchedule[i - 1];
            const next = todaySchedule[i + 1];
            if (prev && next) {
              const start = toMinutes(prev.end);
              const end = toMinutes(next.start);
              const activeNext = todaySchedule.filter((entry) => {
                if (entry.type === "class") {
                  return toMinutes(next.start) >= toMinutes(entry.start) && toMinutes(next.start) < toMinutes(entry.end);
                }
              });

              if (nowMinutes >= start && nowMinutes < end) {
                activeInfo = { type: "break", start: prev.end, end: next.start, nextClass: activeNext };
              }
            }
          } else if (entry.type === "lunch") {
            if (nowMinutes >= toMinutes(entry.start) && nowMinutes < toMinutes(entry.end)) {
              activeInfo = { type: "lunch", start: entry.start, end: entry.end };
            }
          }
        }
      }

      setCurrentInfo(activeInfo);
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 30 * 1000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="window">
      <div>
        {currentInfo ? (
          currentInfo.type === "class" ? (
            <div className="info">
              <p className="currentTitle">Aula{currentInfo.entries.length > 1 ? "s" : ""}</p>
              <ul className="classes-list">
                {currentInfo.entries.map((c, i) => (
                  <li key={i} className="class-info">
                    <span className="class-info-name">{c.subject}</span> <br />
                    Sala: {c.room} <br />
                    Acaba às: {c.end}
                  </li>
                ))}
              </ul>
            </div>
          ) : currentInfo.type === "break" ? (
            <>
              <div className="info">
                <p className="currentTitle">Intervalo</p>
                <p className="break-info">
                  Acaba às: <span className="break-info-time">{currentInfo.end}</span>
                </p>
              </div>
              <div className="next-classes">
                  <button className="button-next-classes" onClick={() => setShowNextClasses(!showNextClasses)}>Próxima Aula</button>
                  {showNextClasses && (
                    <ul className="next-classes-list">
                      {currentInfo.nextClass.map((c, i) => (
                        <li key={i} className="next-class-info">
                          <span className="next-class-info-name">{c.subject}</span> <br />
                          Sala: {c.room} <br />
                          Acaba às: {c.end}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
          ) : (
            <div className="info">
              <p className="currentTitle">Intervalo de Almoço</p>
              <p>
                Acaba às: <span className="lunchBreak-info">{currentInfo.end}</span>
              </p>
            </div>
          )
        ) : (
          <p className="noClass">Nenhuma aula agora</p>
        )}
      </div>
  </div>
  );
}

export default Homepage;
