import React from "react";
import "./css/DashboardStyle.css";
import Header from "../../components/Header";
import DashBoardLeft from "../../components/DashBoardLeft";
import DashBoardRight from "../../components/DashBoardRight";

const DashBoard = () => {
  return (
    <div className="Container">
      <Header />
      <section className="Bank_Form_Container">
        <article className="Bank_Form_Wrapper">
          <DashBoardLeft />
          <DashBoardRight />
        </article>
      </section>
    </div>
  );
};

export default DashBoard;
