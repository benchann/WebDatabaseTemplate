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
  public DbSet<Article> Articles { get; set; } = default!;
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
        else if (request.Name == "publishArticle")
        {
          var (title, content, tags, token) = request.GetParams<(string, string, string, string)>();
          var user = database.Users.FirstOrDefault(u => u.Token == token);
          
          if (user == null)
          {
            request.Respond(false);
            continue;
          }

          var article = new Article(title, content, tags, user.Id);
          database.Articles.Add(article);
          database.SaveChanges();

          request.Respond(true);
        }
        else if (request.Name == "getArticles")
        {
          // FIXED: Restored the proper query so it sends the AuthorUsername back to your TypeScript
          var feedData = database.Articles
            .Include(a => a.User)
            .OrderByDescending(a => a.Id)
            .Select(a => new
            {
              a.Id,
              a.Title,
              a.Content,
              a.Tags,
              AuthorUsername = a.User.Username
            })
            .ToList();
            
          request.Respond(feedData);
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
class User(string username, string password, string token)
{
  public int Id { get; set; } = default!;
  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
  public string Token { get; set; } = token;
}
class Article(string title, string content, string tags, int userId)
{
  public int Id { get; set; } = default!;
  public string Title { get; set; } = title;
  public string Content { get; set; } = content;
  public string Tags { get; set; } = tags;
  public int UserId { get; set; } = userId;
  public User User { get; set; } = default!;
}