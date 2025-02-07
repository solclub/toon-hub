import { useStopwatch, useTimer } from "react-timer-hook";
import { useEffect } from "react";

type Props = {
  date: Date;
  finishedCallback?: () => void;
  className?: string;
  isLongForm?: boolean;
};

const CountDown = ({ date, finishedCallback, className, isLongForm }: Props) => {
  const { seconds, minutes, hours, days, restart } = useTimer({
    expiryTimestamp: date,
    onExpire: finishedCallback,
  });

  useEffect(() => {
    restart(date, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const padStart = (value: number) => ("00" + value).slice(-2);
  let format = "";

  format += days > 0 ? (isLongForm ? `${days} days, ` : `${days}:`) : "";
  format += hours > 0 ? (isLongForm ? `${padStart(hours)} hrs ` : `${padStart(hours)}:`) : "";
  format += minutes > 0 ? (isLongForm ? `${padStart(minutes)}m : ` : `${padStart(minutes)}:`) : "";
  format += seconds > 0 ? (isLongForm ? `${padStart(seconds)}s` : `${padStart(seconds)}`) : "";

  return <div className={className}>{format}</div>;
};

const StopWatch = ({ date }: Props) => {
  const { seconds, minutes, hours, days, reset } = useStopwatch({});

  useEffect(() => {
    reset(plusDate(date), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const padStart = (value: number) => ("00" + value).slice(-2);
  const format = `${days}:${padStart(hours)}:${padStart(minutes)}:${padStart(seconds)}`;

  return <div>{format}</div>;
};

const plusDate = (date: Date) => {
  const diff = new Date(new Date().getTime() - date.getTime());
  const plusDate = new Date(new Date().getTime() + diff.getTime());
  return plusDate;
};
export { CountDown, StopWatch };
