import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

type TimezonePropType = {
  tz: string;
  dateFormat: string;
  className?: string;
};

export default function Timezone({ tz, dateFormat, className }: TimezonePropType) {
  const [datetime, setDatetime] = useState(TZDate.tz(tz));
  const timeFormatted = format(datetime, dateFormat).toString();

  useEffect(() => {
    const interval = setInterval(() => {
      setDatetime(TZDate.tz(tz));
    }, 1000);

    return () => clearInterval(interval);
  }, [tz]);

  return (
    <span className={className}>{timeFormatted}</span>
  );
}
