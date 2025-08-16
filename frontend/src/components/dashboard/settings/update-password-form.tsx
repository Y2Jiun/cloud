"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { KeyIcon } from "@phosphor-icons/react/dist/ssr/Key";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { authClient } from "@/lib/auth/client";

const schema = zod
	.object({
		currentPassword: zod.string().min(1, { message: "Current password is required" }),
		newPassword: zod.string().min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: zod.string().min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type Values = zod.infer<typeof schema>;

const defaultValues = { currentPassword: "", newPassword: "", confirmPassword: "" } satisfies Values;

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
	let score = 0;
	if (password.length >= 8) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	const strength = [
		{ label: "Very Weak", color: "error" },
		{ label: "Weak", color: "error" },
		{ label: "Fair", color: "warning" },
		{ label: "Good", color: "info" },
		{ label: "Strong", color: "success" },
	];

	return { score: (score / 5) * 100, ...strength[Math.min(score, 4)] };
};

export function UpdatePasswordForm(): React.JSX.Element {
	const [isPending, setIsPending] = React.useState<boolean>(false);
	const [showCurrentPassword, setShowCurrentPassword] = React.useState<boolean>(false);
	const [showNewPassword, setShowNewPassword] = React.useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
	const [successMessage, setSuccessMessage] = React.useState<string>("");

	const {
		control,
		handleSubmit,
		setError,
		watch,
		reset,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	const newPassword = watch("newPassword");
	const passwordStrength = getPasswordStrength(newPassword || "");

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);
			setSuccessMessage("");

			try {
				// Here you would call your API to update the password
				// For now, we'll simulate the API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate success
				setSuccessMessage("Password updated successfully!");
				reset();
			} catch (error) {
				setError("root", { type: "server", message: "Failed to update password" });
			}

			setIsPending(false);
		},
		[setError, reset]
	);

	return (
		<Card>
			<CardHeader
				avatar={<KeyIcon fontSize="var(--icon-fontSize-lg)" />}
				title="Update Password"
				subheader="Change your account password for better security"
			/>
			<Divider />
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent>
					<Stack spacing={3} sx={{ maxWidth: "sm" }}>
						{/* Current Password */}
						<Controller
							control={control}
							name="currentPassword"
							render={({ field }) => (
								<FormControl error={Boolean(errors.currentPassword)} fullWidth>
									<InputLabel>Current Password</InputLabel>
									<OutlinedInput
										{...field}
										endAdornment={
											showCurrentPassword ? (
												<EyeIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowCurrentPassword(false)}
												/>
											) : (
												<EyeSlashIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowCurrentPassword(true)}
												/>
											)
										}
										label="Current Password"
										type={showCurrentPassword ? "text" : "password"}
									/>
									{errors.currentPassword ? <FormHelperText>{errors.currentPassword.message}</FormHelperText> : null}
								</FormControl>
							)}
						/>

						{/* New Password */}
						<Controller
							control={control}
							name="newPassword"
							render={({ field }) => (
								<FormControl error={Boolean(errors.newPassword)} fullWidth>
									<InputLabel>New Password</InputLabel>
									<OutlinedInput
										{...field}
										endAdornment={
											showNewPassword ? (
												<EyeIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowNewPassword(false)}
												/>
											) : (
												<EyeSlashIcon
													cursor="pointer"
													fontSize="var(--icon-fontSize-md)"
													onClick={() => setShowNewPassword(true)}
												/>
											)
										}
										label="New Password"
										type={showNewPassword ? "text" : "password"}
									/>
									{errors.newPassword ? <FormHelperText>{errors.newPassword.message}</FormHelperText> : null}

									{/* Password Strength Indicator */}
									{newPassword && (
										<Box sx={{ mt: 1 }}>
											<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
												<Typography variant="caption">Password strength:</Typography>
												<Typography variant="caption" color={`${passwordStrength.color}.main`}>
													{passwordStrength.label}
												</Typography>
											</Box>
											<LinearProgress
												variant="determinate"
												value={passwordStrength.score}
												color={passwordStrength.color as any}
												sx={{ height: 4, borderRadius: 2 }}
											/>
										</Box>
									)}
								</FormControl>
							)}
						/>

						{/* Confirm Password */}
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field }) => (
								<FormControl error={Boolean(errors.confirmPassword)} fullWidth>
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
							<Typography variant="subtitle2" gutterBottom>
								Password Requirements:
							</Typography>
							<Typography variant="body2" color="text.secondary" component="ul" sx={{ m: 0, pl: 2 }}>
								<li>At least 8 characters long</li>
								<li>Include uppercase and lowercase letters</li>
								<li>Include at least one number</li>
								<li>Include at least one special character</li>
							</Typography>
						</Box>

						{/* Success Message */}
						{successMessage && <Alert color="success">{successMessage}</Alert>}

						{/* Error Message */}
						{errors.root && <Alert color="error">{errors.root.message}</Alert>}
					</Stack>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button disabled={isPending} type="submit" variant="contained">
						{isPending ? "Updating..." : "Update Password"}
					</Button>
				</CardActions>
			</form>
		</Card>
	);
}
