import SVGIcon from "assets/svg/SVGIcon";
import { motion } from "framer-motion";
import React from "react";
import type { PaymentOption } from "server/database/models/catalog.model";
import { PaymentToken } from "server/database/models/catalog.model";
import classNames from "classnames";
import MainButton from "./MainButton";

const balanceIcons = {
  [PaymentToken.BTF]: <span className="inline">🦋</span>,
  [PaymentToken.SOL]: <SVGIcon.Sol size={30} />,
  [PaymentToken.RUDE]: <SVGIcon.Rude size={30} />,
};

const PaymentMethodSelector: React.FC<{
  paymentOptions: PaymentOption[];
  selected?: PaymentOption;
  onChange: (otp: PaymentOption) => void;
  overridePaymentOption?: PaymentOption;
}> = ({ paymentOptions, selected, onChange, overridePaymentOption }) => {
  const onButtonClick = (otp: PaymentOption) => {
    onChange(otp);
  };

  if (overridePaymentOption) {
    return (
      <div className="flex w-full font-mono">
        <div className="flex w-full flex-wrap justify-evenly px-5 text-start font-mono text-xl">
          <React.Fragment key={overridePaymentOption.type}>
            <motion.button
              onClick={() => onButtonClick(overridePaymentOption)}
              className={classNames(
                "flex w-full items-center rounded-xl border-4  bg-slate-900 p-3 text-2xl lg:w-1/4",
                selected?.type == overridePaymentOption.type
                  ? "border-orange-400"
                  : "border-gray-400"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {overridePaymentOption.amounts.map(({ token, amount }, j) => (
                <React.Fragment key={j}>
                  <div className="flex w-full grow items-center text-center">
                    <div className="w-full">
                      <div>{amount}</div>
                      <div className="items-center">{balanceIcons[token]}</div>
                    </div>
                  </div>
                  {j < overridePaymentOption.amounts.length - 1 && <span className="">+</span>}
                </React.Fragment>
              ))}
            </motion.button>
          </React.Fragment>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full font-sans font-bold flex-wrap justify-evenly text-xl items-center gap-4">
      {paymentOptions
        .filter((x) => x.enabled)
        ?.sort((a, b) => a.order - b.order)
        ?.map((opt, i) => (
          <React.Fragment key={opt.type}>
            <MainButton
              color={selected?.type == opt.type ? "yellow" : "gray"}
              onClick={() => onButtonClick(opt)}
              className={classNames("flex items-center", paymentOptions.filter((x) => x.enabled).length > 1 ? "grow" : "w-2/5")}
            >
              {opt.amounts.map(({ token, amount }, j) => (
                <React.Fragment key={j}>
                  <div className="flex w-full items-center justify-center gap-2">
                    <div className="items-center">{balanceIcons[token]}</div>
                    <div>{amount}</div>
                  </div>
                  {j < opt.amounts.length - 1 && <span className="">+</span>}
                </React.Fragment>
              ))}
            </MainButton>
            {i < paymentOptions.filter((x) => x.enabled).length - 1 && (
              <span>or</span>
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default PaymentMethodSelector;
