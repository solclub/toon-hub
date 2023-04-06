import RudeToken from "assets/images/rudetoken.png";
import SVGIcon from "assets/svg/SVGIcon";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { PaymentOption } from "types/catalog";
import { PaymentToken } from "types/catalog";
import classNames from "classnames";

const balanceIcons = {
  [PaymentToken.BTF]: <span className="inline">🦋</span>,
  [PaymentToken.SOL]: (
    <span className="inline">
      <SVGIcon.Sol size={30} />
    </span>
  ),
  [PaymentToken.RUDE]: (
    <Image className="inline" src={RudeToken} alt={"title"} width={30} height={30}></Image>
  ),
};

const PaymentMethodSelector: React.FC<{
  paymentOptions: PaymentOption[];
  onChange: (otp: PaymentOption) => void;
}> = ({ paymentOptions, onChange }) => {
  const [selectedMethod, setselectedMethod] = useState("");

  useEffect(() => {
    const type = paymentOptions[0]?.type;
    if (type) setselectedMethod(type);
  }, [paymentOptions]);

  const onButtonClick = (otp: PaymentOption) => {
    setselectedMethod(otp.type);
    onChange(otp);
  };

  return (
    <div className="flex w-full font-mono">
      <div className="flex w-full flex-wrap justify-evenly px-5 text-start font-mono text-xl">
        {paymentOptions
          ?.sort((a, b) => a.order - b.order)
          ?.map((opt, i) => (
            <React.Fragment key={opt.type}>
              <motion.button
                onClick={() => onButtonClick(opt)}
                className={classNames(
                  "flex w-full items-center rounded-xl border-4 border-[#605031] bg-slate-900 p-3 text-2xl lg:w-1/4",
                  { "bg-amber-600": selectedMethod == opt.type }
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {opt.amounts.map(({ token, amount }, j) => (
                  <React.Fragment key={j}>
                    <div className="flex w-full grow items-center text-center">
                      <div className="w-full">
                        <div>{amount}</div>
                        <div>{balanceIcons[token]}</div>
                      </div>
                    </div>
                    {j < opt.amounts.length - 1 && <span className="">+</span>}
                  </React.Fragment>
                ))}
              </motion.button>
              {i < paymentOptions.length - 1 && (
                <div className="divider divider-horizontal ">or</div>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
