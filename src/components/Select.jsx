import { Children, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

// A glass dropdown that replaces the browser's own <select> menu (which can't be styled).
// Same API as <select>: pass <option> children and an onChange that reads e.target.value.

const textOf = (n) => (Array.isArray(n) ? n.map(textOf).join("") : n == null || typeof n === "boolean" ? "" : String(n));

export default function Select({ value, onChange, children, className = "", disabled, ...rest }) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((c) => c?.props)
        .map((c) => ({ value: String(c.props.value ?? textOf(c.props.children)), label: textOf(c.props.children), disabled: c.props.disabled })),
    [children]
  );
  const current = options.find((o) => o.value === String(value));
  const btn = useRef(null);
  const list = useRef(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const room = window.innerHeight - r.bottom;
    const want = Math.min(280, options.length * 42 + 12);
    const up = room < want + 16 && r.top > room;
    setPos({
      left: r.left,
      width: Math.max(r.width, 160),
      ...(up ? { bottom: window.innerHeight - r.top + 6, maxHeight: Math.min(280, r.top - 16) } : { top: r.bottom + 6, maxHeight: Math.min(280, room - 16) }),
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (list.current?.contains(e.target) || btn.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = (e) => !list.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === String(value))));
    setOpen(true);
  };

  const choose = (o) => {
    if (o.disabled) return;
    setOpen(false);
    btn.current?.focus();
    if (o.value !== String(value)) onChange?.({ target: { value: o.value }, currentTarget: { value: o.value } });
  };

  const onKeyDown = (e) => {
    const k = e.key;
    if (!open) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't close the modal behind the menu
      setOpen(false);
    } else if (k === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (k === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (k === "Home" || k === "End") {
      e.preventDefault();
      setActive(k === "Home" ? 0 : options.length - 1);
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      options[active] && choose(options[active]);
    } else if (k === "Tab") {
      setOpen(false);
    } else if (k.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(k.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        className={`input select-btn ${className} ${open ? "open" : ""}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        {...rest}
      >
        <span className="select-label">{current?.label ?? ""}</span>
        <ChevronDown size={16} className="select-chev" />
      </button>
      {open &&
        pos &&
        createPortal(
          <ul ref={list} id={`${id}-list`} role="listbox" className="select-menu glass" style={pos} onKeyDown={onKeyDown}>
            {options.map((o, i) => (
              <li
                key={o.value}
                data-i={i}
                role="option"
                aria-selected={o.value === String(value)}
                aria-disabled={o.disabled || undefined}
                className={`select-opt ${i === active ? "active" : ""} ${o.value === String(value) ? "sel" : ""}`}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o)}
              >
                <span>{o.label}</span>
                {o.value === String(value) && <Check size={15} />}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
