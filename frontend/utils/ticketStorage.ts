export const raiseTicket = (data: any) => { console.log("Ticket raised", data); return { id: "TKT-" + Math.floor(Math.random() * 10000) }; };
