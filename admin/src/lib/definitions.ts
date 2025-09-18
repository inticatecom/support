// Resources
import { NextApiResponse } from "next";
import { UseFormRegisterReturn } from "react-hook-form";

/** The result or response of an API request. */
export type Result<T> = Promise<Readonly<NextApiResponse<T> | Response>>;

/** Represents a base class name attribute to a React component. */
export interface Class {
  /** Any styles to apply to the element. */
  className?: string;
}

/** Represents children of a component. */
export interface Children {
  /** The component's children. */
  children: React.ReactNode;
}

/** Properties applied to the button component. */
export type ButtonProps = {
  /** The type of button. */
  type?: "submit" | "button";
  /** The color scheme to use. */
  scheme?: "primary" | "secondary";
  /** An event that triggers when clicking the button. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether or not the button is in it's loading state. */
  loading?: boolean;
  /** Whether or not the button is disabled. */
  disabled?: boolean;
} & Class &
  Children;

/** Properties applied to the input component. */
export type InputProps = {
  /** The label for the input. */
  label?: string;
  /** Text to appear when no text is currently entered. */
  placeholder?: string;
  /** Whether or not to show an asterix above the input indicating that the element is required. */
  withAsterix?: boolean;
  /** The type of input. */
  type?: "text" | "password" | "number";
  /** A hint to display. */
  hint?: React.ReactNode;
  /** Any element that will be displayed at the right inner-side of the input. */
  rightSide?: React.ReactNode;
  /** Whether or not the input is disabled. */
  disabled?: boolean;
  /** The current error. */
  error?: string;
  /** React-Hook-Form register function. */
  register?: UseFormRegisterReturn;
  /** The reference to store the input in. */
  ref?: React.RefObject<HTMLInputElement | null>;
} & Class;

/** Properties applied to the text link component. */
export type TextLinkProps = {
  /** The text in the link. */
  children: string;
  /** The URL of the link. */
  href: string;
} & Class;

/** Properties applied to the select component. */
export type SelectProps = {
  /** The name of the select. */
  name?: string;
  defaultId?: string;
  onChange?: (value?: string) => void;
  /** The options to be displayed in the select menu. */
  list: { id: string; name: string }[];
} & Class &
  Pick<InputProps, "label" | "withAsterix">;

/** Properties applied to the text area component. */
export type TextAreaProps = Omit<InputProps, "ref" | "type" | "rightSide"> & {
  /** The reference to store the text area in. */
  ref?: React.RefObject<HTMLTextAreaElement | null>;
  minRows?: number;
  maxRows?: number;
};

/** Properties applied to the card component. */
export type CardProps = Class & Children;

/** Properties applied to the separator component. */
export type SeparatorProps = Pick<InputProps, "label"> & Class;

/** Properties applied to the callout component. */
export type CalloutProps = {
  /** The type of callout. */
  type?: "success" | "warning" | "error";
} & Class &
  Children;

/** Properties applied to the page component. */
export type PageProps = {
  /** Whether or not the page is loading. */
  loading?: boolean;
  /** The title of the page. */
  title?: string;
} & Class &
  Children;

/** Properties applied to the page link component. */
export type PageLinkProps = Class & Children & Pick<TextLinkProps, "href">;
