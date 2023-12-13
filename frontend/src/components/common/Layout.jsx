import * as React from "react";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import AtiPaper from "./AtiPaper";
import AtiButton, { NavButton } from "./AtiButton";
import { useLocation } from "react-router-dom";

export function ColumnFlow({ sx, ...props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minHeight: "100%",
        minWidth: "100%",
        ...sx,
      }}
      {...props}
    />
  );
}

export function RowFlow({ sx, ...props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        ...sx,
      }}
      {...props}
    />
  );
}

/** A screen containing only a small card with a modal-like design */
export function ModalLikeLayout({ children }) {
  return (
    <Container maxWidth={false} sx={{ display: "flex", flexGrow: 1 }}>
      <AtiPaper sx={{ margin: "auto", padding: "3rem", minWidth: "35.375rem" }}>
        {children}
      </AtiPaper>
    </Container>
  );
}

function SideNav({ to, ...props }) {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <NavButton
      sx={{ marginRight: "auto", fontWeight: isActive ? "bold" : undefined }}
      {...props}
      to={to}
      variant="text"
    />
  );
}

export function LayoutWithNav({ children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", flexShrink: 1, overflow: "hidden" }}>
      <Box
        sx={{ width: "15.5625rem", display: "flex", flexDirection: "column" }}
      >
        <SideNav to="/">Assurance cases</SideNav>
        {/* TODO figure out what to do with these pages */}
        {/* <SideNav to="/groups">Groups</SideNav>
        <SideNav to="/github">Github files</SideNav> */}
        <AtiButton sx={{ marginRight: "auto" }} href="https://alan-turing-institute.github.io/AssurancePlatform/" target="_blank" variant="text">
          Methodology support
        </AtiButton>
      </Box>
      <Box sx={{ flexGrow: 1, flexShrink: 1, maxHeight: "100%", overflowY: "auto" }}>{children}</Box>
    </Box>
  );
}
