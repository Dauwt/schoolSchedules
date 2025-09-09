import { useEffect, useState } from "react";

// Import schedule JSON (put schedule.json in src/ folder)
import scheduleData from "./schedule.json";

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

function App() {
  const [currentInfo, setCurrentInfo] = useState(null);

  useEffect(() => {
    const updateSchedule = () => {
      const now = getLisbonTime();
      const nowMinutes = toMinutes(now);

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const today = days[new Date().getDay()];

      const todaySchedule = scheduleData.schedule[today] || [];

      // Find what matches current time
      const active = todaySchedule.filter((entry) => {
        if (entry.type === "break") return false;
        if (entry.type === "lunch") {
          return nowMinutes >= toMinutes(entry.start) && nowMinutes < toMinutes(entry.end);
        }
        return nowMinutes >= toMinutes(entry.start) && nowMinutes < toMinutes(entry.end);
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
              if (nowMinutes >= start && nowMinutes < end) {
                activeInfo = { type: "break", start: prev.end, end: next.start };
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
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Class Schedule</h1>

        {currentInfo ? (
          currentInfo.type === "class" ? (
            <div>
              <p className="text-lg font-semibold">Current Class{currentInfo.entries.length > 1 ? "es" : ""}:</p>
              <ul className="mt-3 space-y-2">
                {currentInfo.entries.map((c, i) => (
                  <li key={i} className="p-3 bg-gray-200 rounded-lg">
                    <span className="font-bold">{c.subject}</span> <br />
                    Room: {c.room} <br />
                    Ends at: {c.end}
                  </li>
                ))}
              </ul>
            </div>
          ) : currentInfo.type === "break" ? (
            <div>
              <p className="text-lg font-semibold">Break Time</p>
              <p>
                Ends at: <span className="font-bold">{currentInfo.end}</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold">Lunch Break</p>
              <p>
                Ends at: <span className="font-bold">{currentInfo.end}</span>
              </p>
            </div>
          )
        ) : (
          <p className="text-gray-500">No classes right now</p>
        )}
      </div>
    </div>
  );
}

export default App;
