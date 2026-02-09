import { XAxis, YAxis, LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { memo } from 'react';

function StockChart({ history, mode }) {
  const limitedData = history.slice(-30);
  console.log('히스토리', history);
  const data = limitedData.map((h) => ({
    price: h.price,
    time:
      mode === 'realtime'
        ? new Date(h.time).toLocaleTimeString('ko-kr', { hour12: false })
        : h.time,
  }));

  // const data = limitedData.map((item) => ({
  //   time: new Date(item.time).toLocaleTimeString(),
  //   price: item.price,
  // }));
  //slice는 (begin,end) 두 가지 인자를 받으며
  //arr = [0,1,2,3,4]
  //arr.slice(1,3) 이면 두번째부터 세번때 요소까지만 => 1,2
  //arr.slice(-2) 이면 뒤에서 2개까지만 (3,4)
  //arr.slice(-4,-1) 이면 뒤 -4번째 ~ 뒤 1번째 전까지만

  //console.log('차트데이터', limitedData);
  // () 가 { index, price } 를 감쏴고 있어 암시적 리턴
  // 명시적 리턴이면 =>
  // {
  //     return {index, price}
  // }
  // {index, price}  괄호로 감싸는 이유는 쉼표가 있을 경우 (index, price) 로 인식하고
  // 마지막 값만 리턴하므로 index를 계산해버리고 price를 반환함 (쉼표 연산자 문제)
  return (
    <div className="stock-chart-wrapper">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']} tickCount={6} />
          <Tooltip
            // labelFormatter={(label) => `시간 : ${label}`}
            formatter={(v) => `${v.toLocaleString()}원`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="red"
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(StockChart);
