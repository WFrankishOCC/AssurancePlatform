import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Text,
  TextInput,
} from "grommet";
import { getBaseURL } from "./utils.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      window.location.replace("/");
    } else {
      setLoading(false);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const user = {
      email: email,
      password: password,
    };

    fetch(`${getBaseURL()}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.key) {
          localStorage.clear();
          localStorage.setItem("token", data.key);
          window.location.replace("/");
        } else {
          setEmail("");
          setPassword("");
          localStorage.clear();
          setErrors(true);
        }
      });
  };
  return (
    <Box>
      <Box gap="medium" pad="medium" width="medium">
        {loading === false && <Heading level={2}>Login</Heading>}
        {errors === true && (
          <Heading level={2}>Cannot log in with provided credentials</Heading>
        )}
        {loading === false && (
          <Form onSubmit={onSubmit}>
            <FormField htmlFor="email" label="Email address">
              <TextInput
                name="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField htmlFor="password" label="Password">
              <TextInput
                name="password"
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <Button type="submit" label="Login" primary={true} />
          </Form>
        )}
      </Box>
      <Box gap="small" pad="medium" width="medium">
        <Text>Not already registered?</Text>
        <Button href="/signup/" label="Sign-up" />
      </Box>
    </Box>
  );
};

export default Login;
