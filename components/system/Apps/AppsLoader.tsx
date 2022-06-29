import { ProcessConsumer } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const AppsLoader: FC = () => (
  <ProcessConsumer>
    {({ processes = {} }) => (
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {Object.entries(processes)
          .filter(([, { closing }]) => !closing)
          .map(
            ([id, { Component, hasWindow }]) =>
              id &&
              Component && (
                <RenderComponent
                  key={id}
                  Component={Component}
                  hasWindow={hasWindow}
                  id={id}
                />
              )
          )}
      </AnimatePresence>
    )}
  </ProcessConsumer>
);

export default AppsLoader;
