import { createHashRouter } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Home from "./views/admin/Home.jsx";
import Product from "./views/admin/Product.jsx";
import Article from "./views/admin/Article.jsx";
import Order from "./views/admin/Order.jsx";
import Coupon from "./views/admin/Coupon.jsx";
import Image from "./views/admin/Image.jsx";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "product",
        element: <Product />,
      },
      {
        path: "article",
        element: <Article />,
      },
      {
        path: "order",
        element: <Order />,
      },
      {
        path: "coupon",
        element: <Coupon />,
      },
      {
        path: "image",
        element: <Image />,
      },
    ],
  },
]);
