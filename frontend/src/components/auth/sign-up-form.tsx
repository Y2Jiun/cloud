"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/hooks/use-user";

const schema = zod.object({
	firstName: zod.string().min(1, { message: "First name is required" }),
	lastName: zod.string().min(1, { message: "Last name is required" }),
	email: zod
		.string()
		.min(8, { message: "Email must be at least 8 characters" })
		.email({ message: "Please enter a valid email address" }),
	password: zod
		.string()
		.min(8, { message: "Password must be at least 8 characters" })
		.refine((value) => /[a-zA-Z]/.test(value), { message: "Password must contain at least one letter" })
		.refine((value) => /[0-9]/.test(value), { message: "Password must contain at least one number" })
		.refine((value) => /[^a-zA-Z0-9]/.test(value), { message: "Password must contain at least one symbol" }),
	terms: zod.boolean().refine((value) => value, "You must accept the terms and conditions"),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: "", lastName: "", email: "", password: "", terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
	const router = useRouter();

	const { checkSession } = useUser();

	const [isPending, setIsPending] = React.useState<boolean>(false);

	const {
		control,
		handleSubmit,
		setError,
		watch,
		setValue,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);

			// Ensure terms are accepted
			if (!values.terms) {
				setError("terms", { type: "manual", message: "You must accept the terms and conditions" });
				setIsPending(false);
				return;
			}

			// Create username from firstName + lastName
			const username = `${values.firstName.trim()}${values.lastName.trim()}`.toLowerCase();

			// Prepare data for signup with username
			const signUpData = {
				...values,
				username,
				name: `${values.firstName} ${values.lastName}`, // Full name for display
			};

			const { error } = await authClient.signUp(signUpData);

			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}

			// Redirect to sign-in page after successful registration
			router.push(paths.auth.signIn);
		},
		[checkSession, router, setError]
	);

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Sign up</Typography>
				<Typography color="text.secondary" variant="body2">
					Already have an account?{" "}
					<Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
						Sign in
					</Link>
				</Typography>
			</Stack>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					<Controller
						control={control}
						name="firstName"
						render={({ field }) => (
							<FormControl error={Boolean(errors.firstName)}>
								<InputLabel>First name</InputLabel>
								<OutlinedInput {...field} label="First name" />
								{errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>
					<Controller
						control={control}
						name="lastName"
						render={({ field }) => (
							<FormControl error={Boolean(errors.lastName)}>
								<InputLabel>Last name</InputLabel>
								<OutlinedInput {...field} label="Last name" />
								{errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="email"
						render={({ field }) => (
							<FormControl error={Boolean(errors.email)}>
								<InputLabel>Email address</InputLabel>
								<OutlinedInput {...field} label="Email address" type="email" />
								{errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>
					<Controller
						control={control}
						name="password"
						render={({ field }) => (
							<FormControl error={Boolean(errors.password)}>
								<InputLabel>Password</InputLabel>
								<OutlinedInput {...field} label="Password" type="password" />
								{errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>
					<Controller
						control={control}
						name="terms"
						render={({ field }) => (
							<div>
								<FormControlLabel
									control={<Checkbox {...field} />}
									label={
										<React.Fragment>
											I have read the{" "}
											<Link component={RouterLink} href={paths.auth.terms} underline="hover">
												terms and conditions
											</Link>
										</React.Fragment>
									}
								/>
								{errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
							</div>
						)}
					/>
					{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
					<Button disabled={isPending} type="submit" variant="contained">
						Sign up
					</Button>
				</Stack>
			</form>
		</Stack>
	);
}
