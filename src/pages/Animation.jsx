import React from "react";
import AnimationList from "../components/animation-list/AnimationList";
import PageHeader from "../components/page-header/PageHeader";

const Animation = () => {
  return (
    <>
      <PageHeader>
        Animation
      </PageHeader>
      <div className="container">
        <div className="section mb-3">
          <AnimationList />
        </div>
      </div>
    </>
  );
};

export default Animation;
