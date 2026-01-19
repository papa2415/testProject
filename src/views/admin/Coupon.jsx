import {useState, useRef, useEffect} from 'react';
import axios from "axios";

//.env
const API_BASE=import.meta.env.VITE_API_BASE;
const API_PATH=import.meta.env.VITE_API_PATH;


export default function Coupon() {

  const token = document.cookie
    .split(";")
    .find((row) => row.startsWith("hexTokenAPI="))
    ?.split("=")[1];
  
  const [data, setData]=useState([]);
  
  //打API
  useEffect(()=>{
    if(!token) return;
    const fetchCoupons=async()=>{
      try {
        const res=await axios.get(`${API_BASE}/api/${API_PATH}/admin/coupons`, 
        {
          headers:{
            Authorization:token,
          },
        });
        setData(res.data.coupons)
      } catch (error) {
        alert('token無效或已過期')
      }
    };
    fetchCoupons();
  },[token])
  
  
  

  return <>{token ? 
      <div className="container">
      <div className="mt-2">
        <h1 className='text-center mb-5'>優惠券列表</h1>
        <table className="table">
        <thead>
          <tr>
            <th scope="col">標題</th>
            <th scope="col">是否啟用</th>
            <th scope="col">折扣幅度</th>
            <th scope="col">到期日</th>
            <th scope="col">折扣碼</th>
          </tr>
        </thead>
        <tbody>
          {data.length===0 ?(
            <tr>
              <td colSpan="5" className='text-center'>
                尚無優惠卷
              </td>
            </tr>
          ):(
            data.map(coupon=>(
          <tr key={coupon.id}>
            <th scope="row">{coupon.title}</th>
            <td>{coupon.is_enabled ? '啟用' : "未啟用"} </td>
            <td>{coupon.percent}</td>
            <td>{new Date(coupon.due_date * 1000).toLocaleDateString()}</td>
            <td>{coupon.code}</td>
          </tr>
          ))
          )
          }
        </tbody>
      </table>
        </div>
      </div>
    : <h1>請先登入</h1>}</>;
}
