import { useState } from "react";
import { checkAdminPassword, unlockAdmin } from "../catalog";

type Props = {
  title?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function AdminLoginModal({
  title = "Admin login",
  onSuccess,
  onCancel,
}: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAdminPassword(password)) {
      setError("Wrong password.");
      return;
    }
    unlockAdmin();
    onSuccess();
  };

  return (
    <div className="search-overlay" role="dialog" aria-label={title}>
      <div className="search-overlay__panel admin-login-modal">
        <header className="search-overlay__head">
          <h2>{title}</h2>
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </header>
        <form className="admin-login" onSubmit={submit}>
          <label className="field">
            <span>Admin password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
