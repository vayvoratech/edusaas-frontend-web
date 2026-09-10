import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  createMiniProject,
  publishMiniProject,
} from "../services/api";
import { getDomainRoles } from "../services/api";

export default function CreateMiniProject() {
  const navigate = useNavigate();

  const [domainRoles, setDomainRoles] = useState([]);
  const [domainRoleId, setDomainRoleId] = useState("");

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] =
    useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDomainRoles = async () => {
      try {
        const data = await getDomainRoles();

        const roles = Array.isArray(data)
          ? data
          : data?.data || [];

        setDomainRoles(roles);

        if (roles.length > 0) {
          setDomainRoleId(
            roles[0].domain_role_id
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load domain roles."
        );
      }
    };

    loadDomainRoles();
  }, []);

  const validate = () => {
    if (!domainRoleId) {
      return "Please select a domain role.";
    }

    if (!title.trim()) {
      return "Project title is required.";
    }

    if (!problemStatement.trim()) {
      return "Problem statement is required.";
    }

    if (dueAt) {
      const parsed = new Date(dueAt);

      if (Number.isNaN(parsed.getTime())) {
        return "Please enter a valid deadline.";
      }
    }

    return null;
  };

  const buildPayload = () => ({
    domain_role_id: domainRoleId,
    title: title.trim(),
    problem_statement: problemStatement.trim(),
    instructions: instructions.trim() || null,
    due_at: dueAt
      ? new Date(dueAt).toISOString()
      : null,
  });

  const handleSaveDraft = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createMiniProject(buildPayload());

      navigate("/app/educator-assessments");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to create mini project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPublishing(true);
      setError(null);

      const assignment =
        await createMiniProject(buildPayload());

      await publishMiniProject(
        assignment.id,
        dueAt
          ? new Date(dueAt).toISOString()
          : null
      );

      navigate("/app/educator-assessments");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to publish mini project."
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() =>
            navigate("/app/educator-assessments")
          }
          className="mb-4"
        >
          ← Back
        </Button>

        <h2 className="text-2xl font-bold text-slate-900">
          Create Mini Project
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Create a role-specific project for learners.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Form */}
      <Card>
        <div className="space-y-6">

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Domain Role
            </label>

            <select
              value={domainRoleId}
              onChange={(e) =>
                setDomainRoleId(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select domain role
              </option>

              {domainRoles.map((role) => (
                <option
                  key={role.domain_role_id}
                  value={role.domain_role_id}
                >
                  {role.domain_name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Build a Task Management Application"
              maxLength={255}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Problem Statement
            </label>

            <textarea
              value={problemStatement}
              onChange={(e) =>
                setProblemStatement(e.target.value)
              }
              rows={7}
              placeholder="Describe the problem the learner needs to solve..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Instructions
            </label>

            <textarea
              value={instructions}
              onChange={(e) =>
                setInstructions(e.target.value)
              }
              rows={6}
              placeholder="Add technical requirements, expected features, submission guidance, etc."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Submission Deadline
            </label>

            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) =>
                setDueAt(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-slate-500 mt-2">
              Leave empty if you do not want to set a deadline.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-slate-200">

            <Button
              variant="outline"
              disabled={saving || publishing}
              onClick={handleSaveDraft}
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              disabled={saving || publishing}
              onClick={handlePublish}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>

          </div>
        </div>
      </Card>
    </div>
  );
}