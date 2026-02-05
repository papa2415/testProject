import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

//.env
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
const INITIAL_MODAL_DATA = {
  title: "",
  is_enabled: 1,
  percent: "",
  due_date: 0,
  code: "",
};

export default function Coupon() {
  const token = document.cookie
    .split(";")
    .find((row) => row.startsWith("hexTokenAPI="))
    ?.split("=")[1];

  const [data, setData] = useState([]);
  const couponModalRef = useRef(null);
  const [modalData, setModalData] = useState(INITIAL_MODAL_DATA);
  const [modalType, setModalType] = useState("");
  const formatDateForInput = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000); // 秒 -> 毫秒
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setModalData((pre) => ({
      ...pre,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchCoupons = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/coupons`, {
        headers: {
          Authorization: token,
        },
      });
      setData(res.data.coupons);
    } catch (error) {
      alert("token無效或已過期");
    }
  };
  useEffect(() => {
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

  const updateCoupon = async () => {
    let method = "post";
    if (modalType === "edit") {
      method = "put";
    }
    const data = {
      data: {
        ...modalData,
        title: modalData.title.trim(),
        is_enabled: modalData.is_enabled ? 1 : 0,
        percent: Number(modalData.percent),
        due_date: modalData.due_date,
        code: modalData.code,
      },
    };
    try {
      let res;
      if (modalType === "create") {
        res = await axios.post(
          `${API_BASE}/api/${API_PATH}/admin/coupon`,
          data,
          {
            headers: { Authorization: token },
          },
        );
      } else {
        res = await axios.put(
          `${API_BASE}/api/${API_PATH}/admin/coupon/${modalData.id}`,
          data,
          {
            headers: { Authorization: token },
          },
        );
      }

      fetchCoupons();
      closeModal();
    } catch (error) {
      console.log(error.response?.data || error.message);
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

  const openModal = (type, coupon) => {
    console.log("類型", type, "優惠卷", coupon);
    setModalType(type);
    setModalData((pre) => ({
      ...pre,
      ...coupon,
    }));
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
                  openModal("create", INITIAL_MODAL_DATA);
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
                        <button
                          type="button"
                          onClick={() => {
                            openModal("edit", coupon);
                          }}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
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
        className="modal fade modal-xl"
        id="couponModal"
        tabIndex="-1"
        aria-labelledby="couponModalLabel"
        aria-hidden="true"
        ref={couponModalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalType === "edit" ? "編輯優惠卷" : "新增優惠卷"}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close bg-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  標題
                </label>
                <input
                  name="title"
                  id="title"
                  type="text"
                  className="form-control"
                  placeholder="請輸入標題"
                  value={modalData.title || ""}
                  onChange={(e) => {
                    handleModalInputChange(e);
                  }}
                />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="percent" className="form-label">
                  折扣幅度
                </label>
                <div className="input-group">
                  <input
                    name="percent"
                    id="percent"
                    type="number"
                    className="form-control"
                    placeholder="折扣幅度"
                    value={modalData.percent}
                    onChange={(e) => {
                      handleModalInputChange(e);
                    }}
                  />
                  <span className="input-group-text">%</span>
                </div>
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="due_date" className="form-label">
                  到期日
                </label>
                <input
                  name="due_date"
                  id="due_date"
                  type="date"
                  className="form-control"
                  value={
                    modalData.due_date
                      ? formatDateForInput(modalData.due_date)
                      : ""
                  }
                  onChange={(e) => {
                    const newTimestamp = Math.floor(
                      new Date(e.target.value).getTime() / 1000,
                    );
                    setModalData({ ...modalData, due_date: newTimestamp });
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  優惠碼
                </label>
                <input
                  name="code"
                  id="code"
                  type="text"
                  className="form-control"
                  placeholder="請輸入優惠碼"
                  value={modalData.code}
                  onChange={(e) => {
                    handleModalInputChange(e);
                  }}
                />
              </div>
              <div className="mb-3 d-flex justify-content-end">
                <div className="form-check">
                  <input
                    name="is_enabled"
                    id="is_enabled"
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => {
                      handleModalInputChange(e);
                    }}
                  />
                  <label className="form-check-label" htmlFor="is_enabled">
                    是否啟用
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={() => closeModal()}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  updateCoupon();
                }}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
