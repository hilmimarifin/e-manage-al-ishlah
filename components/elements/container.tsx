import React from 'react'
import { Card, CardContent } from '../ui/card'

type Props = {
    children: React.ReactNode;
}

const Container = (props: Props) => {
  return (
    <Card>
      <CardContent className="p-6">{props.children}</CardContent>
    </Card>
  );
};

export default Container;