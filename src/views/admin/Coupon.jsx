import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

//.env
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Coupon() {
  const token = document.cookie
    .split(";")
    .find((row) => row.startsWith("hexTokenAPI="))
    ?.split("=")[1];

  const [data, setData] = useState([]);
  const couponModalRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/${API_PATH}/admin/coupons`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        setData(res.data.coupons);
      } catch (error) {
        alert("token無效或已過期");
      }
    };
    fetchCoupons();

    couponModalRef.current = new bootstrap.Modal("#couponModal", {
      keyboard: false,
    });
  }, [token]);

  const deleteCoupon = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/coupon/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      const res2 = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/coupons`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setData(res2.data.coupons);
    } catch (error) {
      alert(error.message);
    }
  };

  // const addCoupon=async()=>{
  //   try {
  //     const data=
  //     const res=await axios.post(`${API_BASE}/api/${API_PATH}/admin/coupon`, {data})
  //     const res2 = await axios.get(
  //       `${API_BASE}/api/${API_PATH}/admin/coupons`,
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       },
  //     );
  //     setData(res2.data.coupons);
  //   } catch (error) {

  //   }
  // }

  const openModal = () => {
    couponModalRef.current.show();
  };

  const closeModal = () => {
    couponModalRef.current.hide();
  };

  return (
    <>
      {token ? (
        <div className="container">
          <div className="mt-2">
            <h1 className="text-center mb-5">優惠券列表</h1>
            <div className="d-flex justify-content-end">
              <button
                onClick={() => {
                  openModal();
                }}
              >
                新增優惠卷
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">標題</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">折扣幅度</th>
                  <th scope="col">到期日</th>
                  <th scope="col">折扣碼</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      尚無優惠卷
                    </td>
                  </tr>
                ) : (
                  data.map((coupon) => (
                    <tr key={coupon.id}>
                      <th scope="row">{coupon.title}</th>
                      <td>{coupon.is_enabled ? "啟用" : "未啟用"} </td>
                      <td>{coupon.percent}</td>
                      <td>
                        {new Date(coupon.due_date * 1000).toLocaleDateString()}
                      </td>
                      <td>{coupon.code}</td>
                      <td>
                        <button>編輯</button>
                        <button
                          data-id={coupon.id}
                          onClick={() => {
                            deleteCoupon(coupon.id);
                          }}
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <h1>請先登入</h1>
      )}

      <div
        className="modal fade"
        id="couponModal"
        tabIndex="-1"
        aria-labelledby="couponModalLabel"
        aria-hidden="true"
        ref={couponModalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="couponModalLabel">
                Modal title
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">...</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  closeModal();
                }}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
