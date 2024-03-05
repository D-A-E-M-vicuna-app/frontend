'use client'
import { GET_TICKETS_BY_USER_ID_QUERY } from "@/apollo/queries";
import TicketCard from "@/components/ticketCard/TicketCard";
import { ApolloClient, InMemoryCache, createHttpLink, useQuery, ApolloProvider } from "@apollo/client"
import { gql } from "@apollo/client";
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';

export enum TicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    CLOSED = "CLOSED",
}

interface Ticket {
    id: number;
    subject: string;
    description: string;
    status: TicketStatus;
    createdAt: string;
    closedAt: string | null;
    userId: number;
    assignedToId: number | null;
    archived: boolean;
}

const columns = [
    { name: 'ID', selector: (row: Ticket) => row.id, sortable: true },
    { name: 'Subject', selector: (row: Ticket) => row.subject, sortable: true },
    { name: 'Description', selector: (row: Ticket) => row.description, sortable: true },
    { name: 'Status', selector: (row: Ticket) => row.status, sortable: true },
    { name: 'Created At', selector: (row: Ticket) => row.createdAt, sortable: true },
    // Agrega aquí las demás columnas que necesites
];


const httpLink = createHttpLink({
    uri: 'http://localhost:3002/graphql',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
console.log("antes de llamar a la query")

function TicketPages() {
    //const userIdString = localStorage.getItem('idUser');
    //const userId = userIdString ? parseInt(userIdString) : 0;
    //const [userId, setUserId] = useState(0);
    const [userId, setUserId] = useState<number | null>(null);
    //console.log("userId: ",userId);
    const [statusFilter, setStatusFilter] = useState<TicketStatus | null>(null);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userIdString = localStorage.getItem('idUser');
            const userId = userIdString ? parseInt(userIdString) : null;
            setUserId(userId);
        }
    }, []);
    //console.log("userId: ",userId);

    //let userId = null;




    const { loading, error, data, refetch } = useQuery(GET_TICKETS_BY_USER_ID_QUERY, {
        variables: { userId: userId },
        skip: userId === null
    });
    //console.log("imprimiendo data: ", data);
    //console.log("despues de llamar a la query", userId)


    const tickets = data?.getTicketsByUserId || [];

    const filteredTickets = tickets.filter((ticket: Ticket) => {
        if (statusFilter && ticket.status !== statusFilter) {
            return false;
        }
        if (dateFilter && new Date(ticket.createdAt) < dateFilter) {
            return false;
        }
        return true;

    });

    // Refetch tickets each time the component is rendered
    useEffect(() => {
        if (userId !== null) {
            refetch();
        }
    }, [userId, refetch]);

    //console.log("imprimmiendo tickets: ", tickets);
    if (loading) return <p>Loading...</p>;
    //if (error) return <p>Error</p>;
    return (
        <div>
            <input type="date" value={dateFilter ? dateFilter.toISOString().substr(0, 10) : ''} onChange={e => setDateFilter(e.target.value ? new Date(e.target.value) : null)} />
            <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value as TicketStatus)}>
                <option value="">All</option>
                <option value={TicketStatus.OPEN}>Open</option>
                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                <option value={TicketStatus.CLOSED}>Closed</option>
            </select>
            {filteredTickets.length === 0 ? (
                <p>Usted no tiene tickets aún.</p>
            ) : (
                <DataTable
                    title="Tickets"
                    columns={columns}
                    data={filteredTickets}
                    pagination
                    onRowClicked={row => {
                        const query = new URLSearchParams({
                            subject: row.subject,
                            description: row.description,
                            status: row.status,
                            createdAt: row.createdAt,
                            userId: String(row.userId),
                            archived: String(row.archived)
                        }).toString();

                        window.location.href = `/dashboard/tickets/${row.id}?${query}`;
                    }}
                />
            )}
        </div>
    )
} export default () => (
    <ApolloProvider client={client}>
        <TicketPages />
    </ApolloProvider>
);