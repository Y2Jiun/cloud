"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";

const schema = zod
	.object({
		password: zod.string().min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: zod.string().min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type Values = zod.infer<typeof schema>;

const defaultValues = { password: "", confirmPassword: "" } satisfies Values;

export function NewPasswordForm(): React.JSX.Element {
	const router = useRouter();
	const [isPending, setIsPending] = React.useState<boolean>(false);
	const [showPassword, setShowPassword] = React.useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
	const [token, setToken] = React.useState<string>("");
	const [successOpen, setSuccessOpen] = React.useState<boolean>(false);
	const [successMessage] = React.useState<string>(
		"Password updated successfully! Please sign in with your new password."
	);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	// Get reset token from sessionStorage
	React.useEffect(() => {
		const storedToken = sessionStorage.getItem("reset-token");
		if (!storedToken) {
			// If no token found, redirect back to reset password page
			router.push(paths.auth.resetPassword);
			return;
		}
		setToken(storedToken);
	}, [router]);

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);

			const { error } = await authClient.updatePassword({
				token,
				newPassword: values.password,
			});

			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}

			setIsPending(false);

			// Clear stored data
			sessionStorage.removeItem("reset-email");
			sessionStorage.removeItem("reset-token");

			// Show success snackbar and redirect shortly after
			setSuccessOpen(true);
			setTimeout(() => {
				router.push(paths.auth.signIn);
			}, 1500);
		},
		[token, setError, router]
	);

	return (
		<Stack spacing={4}>
			<Stack spacing={1}>
				<Typography variant="h4">Set New Password</Typography>
				<Typography color="text.secondary" variant="body2">
					Please enter your new password below. Make sure it's strong and secure.
				</Typography>
			</Stack>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={3}>
					<Controller
						control={control}
						name="password"
						render={({ field }) => (
							<FormControl error={Boolean(errors.password)}>
								<InputLabel>New Password</InputLabel>
								<OutlinedInput
									{...field}
									endAdornment={
										showPassword ? (
											<EyeIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowPassword(false)}
											/>
										) : (
											<EyeSlashIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowPassword(true)}
											/>
										)
									}
									label="New Password"
									type={showPassword ? "text" : "password"}
								/>
								{errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					<Controller
						control={control}
						name="confirmPassword"
						render={({ field }) => (
							<FormControl error={Boolean(errors.confirmPassword)}>
								<InputLabel>Confirm New Password</InputLabel>
								<OutlinedInput
									{...field}
									endAdornment={
										showConfirmPassword ? (
											<EyeIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowConfirmPassword(false)}
											/>
										) : (
											<EyeSlashIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowConfirmPassword(true)}
											/>
										)
									}
									label="Confirm New Password"
									type={showConfirmPassword ? "text" : "password"}
								/>
								{errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					{/* Password Requirements */}
					<Box sx={{ p: 2, bgcolor: "background.level1", borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							Password requirements:
						</Typography>
						<Typography variant="body2" color="text.secondary" component="ul" sx={{ m: 0, pl: 2 }}>
							<li>At least 8 characters long</li>
							<li>Include uppercase and lowercase letters</li>
							<li>Include at least one number</li>
							<li>Include at least one special character</li>
						</Typography>
					</Box>

					{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

					<Button disabled={isPending} type="submit" variant="contained">
						{isPending ? "Updating Password..." : "Update Password"}
					</Button>
				</Stack>
			</form>

			{/* Success Snackbar */}
			<Snackbar open={successOpen} autoHideDuration={1500} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Alert severity="success" variant="filled">
					{successMessage}
				</Alert>
			</Snackbar>
		</Stack>
	);
}
