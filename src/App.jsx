import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import BlogIndex from "./pages/blogindex";
import Blog from "./pages/blog";

function App() {
 const [page, setPage] = useState("blogindex");
  return (
   <> 
    <button onClick={() => setPage("blogindex")}>Blog首頁</button>
      <button onClick={() => setPage("blog")}>Blog</button>
      {page === "blogindex" && < BlogIndex />}
      {page === "blog" && <Blog />}
    <div className="container bg-primary">
      <div className="row p-4">
        <div className="col-md-4">
          <div className="card mb-4" style={{ width: "18rem" }}>
            <img src={viteLogo} className="card-img-top" alt="圖片" />
            <div className="card-body">
              <h5 className="card-title">Card title</h5>
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4" style={{ width: "18rem" }}>
            <img src={viteLogo} className="card-img-top" alt="圖片" />
            <div className="card-body">
              <h5 className="card-title">Card title</h5>
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4" style={{ width: "18rem" }}>
            <img src={viteLogo} className="card-img-top" alt="圖片" />
            <div className="card-body">
              <h5 className="card-title">Card title</h5>
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p>
          <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
            Toggle width collapse
          </button>
        </p>
        <div>
          <div className="collapse collapse-horizontal" id="collapseWidthExample">
            <div className="card card-body" style={{ width: "300px" }}>
              This is some placeholder content for a horizontal collapse. It’s hidden by default and shown when triggered.
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
