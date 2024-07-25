import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  text: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ firstName, text }) => (
  <div>
    <h3>Hi, {firstName}!</h3>

    <p>{text}</p>
  </div>
);
