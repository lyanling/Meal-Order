import type { SettlementOrder } from '../../type';
import style from '../../style/Settlement/SettlementTable.module.css';

const DateParse = (time: string) => {
    const date = new Date(time);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function SettlementTable({ orders, identity }: { orders: SettlementOrder[], identity: 'customer' | 'vendor' }) {
    const content = orders.map(order => {
        return (
            <tr key={order.Order_ID}>
                <td> {DateParse(order.Pickup_Time)} </td>
                <td> {order.Order_ID} </td>
                {identity === 'customer' && <td> {order.Name} </td>}
                <td> {order.Cash_Amount} </td>
            </tr>
        );
    });
    return (
        <table className={style.SettlementTable}>
            <thead>
                <tr>
                    <th>日期 / 時間</th>
                    <th>訂單編號</th>
                    {identity === 'customer' && <th>餐廳</th>}
                    <th>金額</th>
                </tr>
            </thead>
            <tbody>
                {content.length > 0 ? content : <tr><th colSpan={4}> 無訂單紀錄... </th></tr>}
            </tbody>
        </table>
    );
}