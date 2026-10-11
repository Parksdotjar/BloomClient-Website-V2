const request = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "request_failed");
    error.status = response.status;
    throw error;
  }
  return body;
};

export const getAccountCapabilities = () => request("/v1/account/capabilities");
export const listTickets = () => request("/v1/tickets");
export const createTicket = (ticket) => request("/v1/tickets", { method: "POST", body: JSON.stringify(ticket) });
export const getTicket = (id) => request(`/v1/tickets/${encodeURIComponent(id)}`);
export const replyToTicket = (id, message) => request(`/v1/tickets/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ message }) });
export const listOwnerTickets = (status = "") => request(`/v1/owner/tickets${status ? `?status=${encodeURIComponent(status)}` : ""}`);
export const setTicketStatus = (id, status) => request(`/v1/owner/tickets/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });

export const ticketStatus = {
  waiting_on_support: "Waiting for Bloom",
  waiting_on_user: "Waiting for you",
  closed: "Closed",
};

export const formatTicketDate = (value) => new Intl.DateTimeFormat(undefined, {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
}).format(new Date(value));
