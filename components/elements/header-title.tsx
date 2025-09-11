import React from "react";

type Props = {
  title: string;
  description?: string;
};

const HeaderTitle = (props: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{props.title}</h1>
        <p className="text-muted-foreground">{props.description}</p>
      </div>
    </div>
  );
};

export default HeaderTitle;
