import { Application } from 'express';
import { LoginClient } from '../api/LoginClient';

export default function (app: Application): void {
  const apiClient = new LoginClient('http://localhost:4000');

  app.get('/', async (req, res) => {
    try {
      if((req.session as any).authToken) {
        return res.redirect('/tasks');
      }
      res.render('login', {});
    } catch (error) {
      console.error('Error making request:', error);
      res.render('login', {});
    }

  });

  app.post('/login', async (req, res) => {
    try {
      const token = await apiClient.login({ username: 'admin', password: 'password' });
       // store in session
       (req.session as any).authToken = token;

       // redirect the browser to /tasks
       res.redirect("/tasks");
    } catch (error) {
      console.error('Error making request:', error);
      res.render('home', {});
    }
  });
}
