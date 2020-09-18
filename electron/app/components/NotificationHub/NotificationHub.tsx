import React, { useEffect, useState } from "react";
import { animated, useTransition } from "react-spring";
import styled from "styled-components";
import { Close } from "@material-ui/icons";

const Container = styled("div")`
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  top: ${(props) => (props.top ? "2em" : "unset")};
  bottom: ${(props) => (props.top ? "unset" : "2em")};
  margin: 0 auto;
  left: 2em;
  right: 2em;
  font-weight: bold;
  display: flex;
  flex-direction: ${(props) => (props.top ? "column-reverse" : "column")};
  pointer-events: none;
  align-items: ${(props) =>
    props.position === "center" ? "center" : `flex-${props.position || "end"}`};
  @media (max-width: 680px) {
    align-items: center;
  }
`;

const Message = styled(animated.div)`
  margin-top: 1em;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 40ch;
  @media (max-width: 680px) {
    width: 100%;
  }
`;

const MessageText = styled.p`
  margin-top: 1em;
  margin-bottom: 1.5em;
  color: ${({ theme }) => theme.fontDark};
`;

const MessageTitle = styled.h3`
  font-size: 1.5em;
  color: ${({ theme }) => theme.font};
`;

const Content = styled.div`
  color: ${({ theme }) => theme.font};
  background: ${({ theme }) => theme.backgroundDark};
  border: 1px solid ${({ theme }) => theme.backgroundDarkBorder};
  box-shadow: 0 2px 20px ${({ theme }) => theme.backgroundDark};
  padding: 1em 2em 0 2em;
  font-size: 1em;
  display: grid;
  grid-template-columns: ${(props) =>
    props.canClose === false ? "1fr" : "1fr auto"};
  grid-gap: 2em;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
`;

const Button = styled.button`
  cursor: pointer;
  pointer-events: all;
  outline: 0;
  border: none;
  background: transparent;
  display: flex;
  align-self: flex-end;
  position: abo
  overflow: hidden;
  margin: 0;
  padding: 0;
  padding-bottom: 2em;
  color: ${({ theme }) => theme.fontDark};
  :hover {
    color: ${({ theme }) => theme.font};
  }
`;

const Life = animated(styled.div`
  position: absolute;
  bottom: ${(props) => (props.top ? "0.5em" : "0")};
  left: 0px;
  width: auto;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background-image: linear-gradient(
    130deg,
    ${({ theme }) => theme.brand},
    ${({ theme }) => theme.brandFullyTransparent}
  );
  height: 0.5em;
`);

let id = 0;

type Notification = {
  title: string;
  message: string;
  die: boolean;
  titleColor: string;
};

const NotificationHub = ({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  children,
}) => {
  const [refMap] = useState(() => new WeakMap());
  const [cancelMap] = useState(() => new WeakMap());
  const [items, setItems] = useState([]);
  const transitions = useTransition(items, (item) => item.key, {
    from: { opacity: 0, height: 0, life: "100%" },
    enter: (item) => async (next) =>
      await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({ life: "0%" });
      await next({ opacity: 0 });
      await next({ height: 0 });
    },
    onRest: (item) =>
      setItems((state) => state.filter((i) => i.key !== item.key)),
    config: (_, state) =>
      state === "leave" ? [{ duration: timeout }, config, config] : config,
  });

  useEffect(
    () =>
      void children((msg) =>
        setItems((state) => [...state, { key: id++, ...msg }])
      ),
    []
  );
  return (
    <Container>
      {transitions.map(({ key, item, props: { life, ...style } }) => (
        <Message key={key} style={style}>
          <Content ref={(ref) => ref && refMap.set(item, ref)}>
            {true ? <Life style={{ right: life }} /> : null}
            <MessageTitle style={{ color: item.titleColor }}>
              {item.title}
            </MessageTitle>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                cancelMap.has(item) && cancelMap.get(item)();
              }}
            >
              <MessageText>{item.message}</MessageText>
              <Close />
            </Button>
          </Content>
        </Message>
      ))}
    </Container>
  );
};

export default NotificationHub;