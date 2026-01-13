export default function Coupon() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexTokenAPI="))
    ?.split("=")[1];

  return <>{token ? <h1>這是優惠券頁</h1> : <h1>請先登入</h1>}</>;
}
