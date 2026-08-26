import DepartmentRoom from "../components/DepartmentRoom.jsx";
import ReportFeed from "../components/ReportFeed.jsx";
import { CeoRoom, TallyBoard } from "../components/TallyBoard.jsx";

/** 画像そのままのメイン画面：社長室｜部署ルーム｜報告グループ */
export default function OfficeScreen({ state, totals, status }) {
  return (
    <div className="floor">
      <div className="col scroll">
        <CeoRoom status={status} />
        <TallyBoard totals={totals} date={state.date} />
      </div>

      <div className="col scroll">
        <div className="rooms">
          {totals.perDept.map((d) => (
            <DepartmentRoom key={d.id} dept={d} />
          ))}
        </div>
      </div>

      <div className="col">
        <ReportFeed feed={state.feed} live={status === "ready"} />
      </div>
    </div>
  );
}
