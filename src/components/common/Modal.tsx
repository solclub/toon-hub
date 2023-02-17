import classNames from "classnames";
import React from "react";

type Props = {
  children: JSX.Element;
  className: string;
  title?: string;
  triggerId: string;
};

export const Modal = ({ title, children, className, triggerId }: Props) => {
  return (
    <>
      <input type="checkbox" id={triggerId} className="modal-toggle" />
      <div className="modal">
        <div className={classNames("modal-box max-w-5xl", className)}>
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {children}
          <div className="modal-action">
            <label htmlFor={triggerId} className="btn-xs btn">
              Close
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
