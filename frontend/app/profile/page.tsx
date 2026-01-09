"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/error";
import {  validatePassword, validPassword } from "@/lib/password";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import AppShell from "@/components/layout/AppShell";

type UserInfo = {
  id: number;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // profile edit state
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // touched state for validation UI
  const [currentTouched, setCurrentTouched] = useState(false);
  const [newTouched, setNewTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);



  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      setProfileSuccess(null);

      try {
        const data = await api<UserInfo>("/user");
        setUser(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
      } catch (e) {
        // error id 7: "Failed to load user profile"
        setError(handleError(e, 7));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleProfileSave() {
    if (!user) return;

    setError(null);
    setProfileSuccess(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    // Simple validation: if provided, must be at least 2 chars
    if (trimmedFirst.length < 2) {
      setError("First name must be at least 2 characters");
      return;
    }
    if (trimmedLast.length < 2) {
      setError("Last name must be at least 2 characters");
      return;
    }

    if (
      trimmedFirst === (user.firstName ?? "") &&
      trimmedLast === (user.lastName ?? "")
    ) {
      setEditing(false);
      return;
    }

    try {
      setProfileSaving(true);

      const updated = await api<UserInfo>("/user", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: trimmedFirst,
          lastName: trimmedLast,
          id: user.id
        })
      });

      setUser(updated);
      setEditing(false);
      setProfileSuccess("Profile updated successfully");
      setTimeout(() => setProfileSuccess(null), 5000);
    } catch (e) {
      // error id 8: "Failed to update profile"
      setError(handleError(e, 8));
    } finally {
      setProfileSaving(false);
    }
  }

  function handleProfileCancel() {
    if (!user) {
      setEditing(false);
      return;
    }
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEditing(false);
    setError(null);
    setProfileSuccess(null);
  }

 async function handleChangePassword(e: React.FormEvent) {
   e.preventDefault();
   setPasswordError(null);
   setPasswordSuccess(null);

   if (!changingPassword) return;

   if (currentPassword.trim().length === 0) {
     setPasswordError("Current password is required");
     return;
   }
const passwordError = validatePassword(newPassword);
   if (passwordError) {
     setPasswordError(passwordError);
     return;
   }

   if (newPassword !== confirmPassword) {
     setPasswordError("New password and confirmation do not match");
     return;
   }

   try {
     setPasswordBusy(true);

     await api<{ ok: boolean }>("/user/change-password", {
       method: "POST",
       body: JSON.stringify({
         currentPassword,
         newPassword
       })
     });

     setPasswordSuccess("Password updated successfully");
     setCurrentPassword("");
     setNewPassword("");
     setConfirmPassword("");
     setCurrentTouched(false);
     setNewTouched(false);
     setConfirmTouched(false);
     setChangingPassword(false);
   } catch (e) {
     setPasswordError(handleError(e, 9));
   } finally {
     setPasswordBusy(false);
   }
 }

function handleCancelChangePassword() {
  setChangingPassword(false);
  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
  setCurrentTouched(false);
  setNewTouched(false);
  setConfirmTouched(false);
  setPasswordError(null);
  setPasswordSuccess(null);
}

  const firstInvalid = editing && firstName.trim().length < 2;
  const lastInvalid = editing && lastName.trim().length < 2;
  const currentInvalid =
   changingPassword && currentTouched && currentPassword.trim().length === 0;

 const newInvalid =
   changingPassword && newTouched && !validPassword(newPassword);

 const confirmInvalid =
   changingPassword &&
   confirmTouched &&
   (confirmPassword.trim().length === 0 || confirmPassword !== newPassword);
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Profile</h1>
      {loading && <p className="text-sm text-primary">Loading profile…</p>}
      {user && (
        <>
          {/* Profile info + edit */}
          <section className="space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Personal Info</h2>
              {!editing ? (
                <Button
                  onClick={() => {
                    setEditing(true);
                    setProfileSuccess(null);
                    setError(null);
                  }}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    onClick={handleProfileCancel}
                    disabled={profileSaving}
                    className=" mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Email (not editable) */}
              <div>
                <span className="block text-xs font-medium text-slate-500">
                  Email
                </span>
                <span className="text-sm">{user.email}</span>
              </div>

              {/* First + Last name (toggle text vs input) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* FIRST NAME */}
                <div>
                  <label className="block text-xs font-medium text-slate-500">
                    First name
                  </label>

                  {!editing ? (
                    <p className="mt-1 text-sm">
                      {user.firstName || (
                        <span className="text-slate-400">–</span>
                      )}
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`mt-1 w-full rounded-md border px-2 py-1 text-sm ${
                          firstInvalid
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300"
                        }`}
                      />
                      {firstInvalid && (
                        <p className="text-xs text-red-600 mt-1">
                          First name is required.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* LAST NAME */}
                <div>
                  <label className="block text-xs font-medium text-slate-500">
                    Last name
                  </label>

                  {!editing ? (
                    <p className="mt-1 text-sm">
                      {user.lastName || (
                        <span className="text-slate-400">–</span>
                      )}
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`mt-1 w-full rounded-md border px-2 py-1 text-sm ${
                          lastInvalid
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300"
                        }`}
                      />
                      {lastInvalid && (
                        <p className="text-xs text-red-600 mt-1">
                          Last name is required.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editing && (
                <Button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="mt-2 w-full"
                >
                  {profileSaving ? "Saving…" : "Save"}
                </Button>
              )}
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            {profileSuccess && !loading && (
              <p className="text-sm text-success transition-opacity duration-500">
                {profileSuccess}
              </p>
            )}
          </section>

          {/* Change password */}
          <section className="space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Account Security</h2>

              {!changingPassword ? (
                <Button
                  onClick={() => {
                    setChangingPassword(true);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setCurrentTouched(false);
                    setNewTouched(false);
                    setConfirmTouched(false);
                  }}
                >
                  Change password
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleCancelChangePassword}
                  disabled={passwordBusy}
                  className="mt-2"
                >
                  Cancel
                </Button>
              )}
            </div>

            {changingPassword && (
              <form className="space-y-3" onSubmit={handleChangePassword}>
                {/* Current password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500">
                    Current password
                  </label>
                  <div className="mt-1 flex gap-2">
                    <PasswordInput
                      value={currentPassword}
                      onChange={(v) => {
                        setCurrentPassword(v);
                        setCurrentTouched(true);
                      }}
                      invalid={currentInvalid}
                      placeholder="Current password"
                    />
                  </div>
                </div>

                {/* New + confirm */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      New password
                    </label>
                    <div className="mt-1 flex gap-2">
                      <PasswordInput
                        value={newPassword}
                        onChange={(v) => {
                          setNewPassword(v);
                          setNewTouched(true);
                        }}
                        invalid={newInvalid}
                        placeholder="New password"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      At least 8 characters, with uppercase, lowercase, number,
                      and a special character.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      Confirm new password
                    </label>
                    <div className="mt-1 flex gap-2">
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(v) => {
                          setConfirmPassword(v);
                          setConfirmTouched(true);
                        }}
                        invalid={confirmInvalid}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={passwordBusy}
                  className="mt-2 w-full"
                >
                  {passwordBusy ? "Saving…" : "Update password"}
                </Button>

                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600">{passwordSuccess}</p>
                )}
              </form>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
