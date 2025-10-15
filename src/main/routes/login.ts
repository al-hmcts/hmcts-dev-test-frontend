import { Application, Request} from "express";

// Retrieve login client setup from middleware
function getLoginClient(req: Request) {
  return (req as any).clients?.login;
}

export default function (app: Application): void {

  app.get('/', async (req, res) => {
    try {
      if((req.session as any).authToken) {
        return res.redirect('/tasks');
      }
      res.render('login', {});
    } catch (error) {
      console.error('Error making request:', error);
      res.render('error', {});
    }

  });

  app.post('/login', async (req, res) => {
    try {
      const loginClient = getLoginClient(req);
      const token = await loginClient.login({ username: 'admin', password: 'password' });
       // store in session
       (req.session as any).authToken = token;

       // redirect the browser to /tasks
       res.redirect("/tasks");
    } catch (error) {
      console.error('Error making request:', error);
      res.render('error', {});
    }
  });

  app.get('/logout', async (req, res) => {
    try {
      const loginClient = getLoginClient(req);
      loginClient.logout();

      // clear token 
      (req.session as any).authToken = null;

      return res.redirect('/');
    } catch (error) {
      console.error('Error making request:', error);
      res.render('error', {});
    }
  });
}
