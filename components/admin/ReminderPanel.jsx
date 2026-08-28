"use client";

import {
  BellRing,
  Check,
  Circle,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./ReminderPanel.module.css";

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const emptyForm = {
  title: "",
  notes: "",
  reminderTime: "",
  clientId: "",
  clientCompany: "",
};

export default function ReminderPanel() {
  const [selectedDate, setSelectedDate] = useState(localDate);
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/reminders?date=${encodeURIComponent(selectedDate)}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to load reminders");
      setReminders(result.reminders || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    fetch("/api/admin/clients?page=1&limit=100", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => setClients(result?.clients || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setEditingId("");
    setForm(emptyForm);
  }, [selectedDate]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateForm(event) {
    const { name, value } = event.target;
    if (name === "clientId") {
      const client = clients.find((item) => item.id === value);
      setForm((current) => ({
        ...current,
        clientId: value,
        clientCompany: client?.company || "",
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function cancelEdit() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function saveReminder(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editingId
          ? `/api/admin/reminders/${editingId}`
          : "/api/admin/reminders",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, reminderDate: selectedDate }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to save reminder");
      setNotice(editingId ? "Reminder updated." : "Reminder added.");
      cancelEdit();
      await loadReminders();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function editReminder(reminder) {
    setEditingId(reminder._id);
    setForm({
      title: reminder.title || "",
      notes: reminder.notes || "",
      reminderTime: reminder.reminderTime || "",
      clientId: reminder.clientId || "",
      clientCompany: reminder.clientCompany || "",
    });
  }

  async function toggleComplete(reminder) {
    setBusyId(reminder._id);
    setError("");
    try {
      const status = reminder.status === "completed" ? "pending" : "completed";
      const response = await fetch(`/api/admin/reminders/${reminder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to update reminder");
      setReminders((current) =>
        current.map((item) =>
          item._id === reminder._id ? { ...item, status } : item,
        ),
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusyId("");
    }
  }

  async function deleteReminder(reminder) {
    if (!window.confirm(`Delete reminder “${reminder.title}”?`)) return;
    setBusyId(reminder._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/reminders/${reminder._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to delete reminder");
      setReminders((current) =>
        current.filter((item) => item._id !== reminder._id),
      );
      if (editingId === reminder._id) cancelEdit();
      setNotice("Reminder deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyId("");
    }
  }

  const today = localDate();

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>
            <BellRing size={18} /> Reminders
          </h2>
          <p>{selectedDate === today ? "Today’s schedule" : "Selected date"}</p>
        </div>
        <label>
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </div>

      {(error || notice) && (
        <p className={error ? styles.error : styles.notice} role="status">
          {error || notice}
        </p>
      )}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={saveReminder}>
          <h3>{editingId ? "Edit reminder" : "Add reminder"}</h3>
          <input
            name="title"
            value={form.title}
            onChange={updateForm}
            placeholder="What should you remember?"
            maxLength="200"
            required
          />
          <div className={styles.formRow}>
            <input
              type="time"
              name="reminderTime"
              value={form.reminderTime}
              onChange={updateForm}
              aria-label="Reminder time"
            />
            <select
              name="clientId"
              value={form.clientId}
              onChange={updateForm}
              aria-label="Linked CRM client"
            >
              <option value="">No linked client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company || client.name || client.id}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="notes"
            value={form.notes}
            onChange={updateForm}
            placeholder="Optional notes"
            rows="3"
            maxLength="2000"
          />
          <div className={styles.formActions}>
            {editingId && (
              <button type="button" onClick={cancelEdit}>
                <X size={14} /> Cancel
              </button>
            )}
            <button type="submit" className={styles.primary} disabled={saving}>
              {editingId ? <Check size={14} /> : <Plus size={14} />}
              {saving ? "Saving…" : editingId ? "Update" : "Add reminder"}
            </button>
          </div>
        </form>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>Loading reminders…</div>
          ) : reminders.length ? (
            reminders.map((reminder) => (
              <article
                key={reminder._id}
                className={
                  reminder.status === "completed" ? styles.completed : ""
                }
              >
                <button
                  type="button"
                  className={styles.checkButton}
                  onClick={() => toggleComplete(reminder)}
                  disabled={busyId === reminder._id}
                  aria-label={
                    reminder.status === "completed"
                      ? "Mark reminder pending"
                      : "Mark reminder completed"
                  }
                >
                  {reminder.status === "completed" ? (
                    <Check size={15} />
                  ) : (
                    <Circle size={15} />
                  )}
                </button>
                <div className={styles.reminderBody}>
                  <strong>{reminder.title}</strong>
                  <span>
                    {reminder.reminderTime && (
                      <em>
                        <Clock3 size={12} /> {reminder.reminderTime}
                      </em>
                    )}
                    {reminder.clientCompany && (
                      <em>{reminder.clientCompany}</em>
                    )}
                  </span>
                  {reminder.notes && <p>{reminder.notes}</p>}
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() => editReminder(reminder)}
                    aria-label="Edit reminder"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReminder(reminder)}
                    disabled={busyId === reminder._id}
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.empty}>
              <BellRing size={25} />
              <strong>No reminders for this date</strong>
              <span>Add one using the form.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
