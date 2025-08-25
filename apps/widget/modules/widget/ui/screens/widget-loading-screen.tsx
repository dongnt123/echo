"use client";

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useAction, useMutation } from "convex/react";
import { LoaderIcon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import WidgetHeader from "../components/widget-header";

type InitStep = "storage" | "org" | "session" | "settings" | "vapi" | "done";

const WidgetLoadingScreen = ({ organizationId }: { organizationId: string | null }) => {
  const [step, setStep] = useState<InitStep>("org");
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const loadingMessage = useAtomValue(loadingMessageAtom);
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);

  // Step 1: Validate organization
  const validateOrganization = useAction(api.public.organizations.validate);
  useEffect(() => {
    if (step !== "org") return;
    setLoadingMessage("Finding organization ID...");

    if (!organizationId) {
      setErrorMessage("Organization ID is required!");
      setScreen("error");
      return;
    }
    setLoadingMessage("Verifying organization...");

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid organization ID!");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Failed to verify organization!");
        setScreen("error");
      })
  }, [step, organizationId, setErrorMessage, setScreen, setLoadingMessage, validateOrganization, setOrganizationId, setStep]);

  // Step 2: Validate session
  const validateSession = useMutation(api.public.contactSessions.validate);
  useEffect(() => {
    if (step !== "session") return;
    setLoadingMessage("Finding contact session ID...");

    if (!contactSessionId) {
      setIsSessionValid(false);
      setStep("done");
      return;
    }
    setLoadingMessage("Validating session...");

    validateSession({ contactSessionId })
      .then((result) => {
        setIsSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setIsSessionValid(false);
        setStep("done");
      })
  }, [step, setLoadingMessage, contactSessionId, setIsSessionValid, setStep, validateSession]);

  // Step 3: Finish process
  useEffect(() => {
    if (step !== "done") return;

    const hasValidSession = isSessionValid && contactSessionId;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, isSessionValid, contactSessionId, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-muted-foreground">
        <LoaderIcon className="size-6 animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  )
}

export default WidgetLoadingScreen