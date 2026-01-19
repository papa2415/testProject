import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            觀葉森活
          </Link>
          {/*  手機版按鈕  */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/product">
                  產品頁
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/article">
                  文章頁
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/order">
                  訂單頁
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/coupon">
                  優惠券頁
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/image">
                  圖片上傳頁
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
}
