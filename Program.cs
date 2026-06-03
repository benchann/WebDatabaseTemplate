using System;
using System.Data.Common;
using System.Linq;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Project.DatabaseUtilities;
using Project.LoggingUtilities;
using Project.ServerUtilities;

class Database() : DatabaseCore("database")
{
  public DbSet<User> Users { get; set; } = default!;
}
class User(string username, string password, string token)
{
  public int Id { get; set; } = default!;
  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
  public string Token { get; set; } = token;
}
class Program
{
  static void Main()
  {
    int port = 5000;

    var server = new Server(port);
    var database = new Database();

    Console.WriteLine("The server is running");
    Console.WriteLine($"Local:   http://localhost:{port}/website/pages/index.html");
    Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/index.html");

    while (true)
    {
      var request = server.WaitForRequest();

      Console.WriteLine($"Recieved a request: {request.Name}");

      try
      {
        if (request.Name == "getUser")
        {
          var token = request.GetParams<string>();
          var user = database.Users.FirstOrDefault(u => u.Token == token);
          request.Respond(user);
        }
        if (request.Name == "signUp")
        {
          var (username, password) = request.GetParams<(string, string)>();

          if (database.Users.Any(u => u.Username == username))
          {
            request.Respond<string?>(null);
            continue;
          }

          var token = Guid.NewGuid().ToString();
          var user = new User(username, password, token);
          database.Users.Add(user);
          database.SaveChanges();

          request.Respond(token);
        }
        else if (request.Name == "logIn")
        {
          var (username, password) = request.GetParams<(string, string)>();
          var user = database.Users.FirstOrDefault(u =>u.Username == username &&u.Password == password);

          request.Respond(user?.Token);
        }
      }
      catch (Exception exception)
      {
        request.SetStatusCode(500);
        Log.WriteException(exception);
      }
    }
  }
}
