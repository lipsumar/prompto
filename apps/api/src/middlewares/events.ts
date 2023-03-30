import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import invariant from 'tiny-invariant';

let clients: { id: number; response: Response; userId: string }[] = [];

export function eventsHandler(request: Request, response: Response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify({ hello: true })}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    userId: (response.locals.user as User).id,
    response,
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
}

export function sendEventToUser(userId: string, event: any) {
  const client = clients.find((c) => c.userId === userId);
  //invariant(client, 'event client not found');
  if (client) {
    client.response.write(`data:${JSON.stringify(event)}\n\n`);
  }
}
