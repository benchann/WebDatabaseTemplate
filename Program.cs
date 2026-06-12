using System;
using System.Data.Common;
using System.Linq;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Project.DatabaseUtilities;
using Project.LoggingUtilities;
using Project.ServerUtilities;
using System.Collections.Generic;
class Database() : DatabaseCore("database")
{
    public DbSet<User> Users { get; set; } = default!;
    public DbSet<Article> Articles { get; set; } = default!;
    public DbSet<Vote> Votes { get; set; } = default!;
    public DbSet<Pin> Pins { get; set; } = default!;
    public DbSet<Draft> Drafts { get; set; } = default!;
}

class Program
{
    static void Main()
    {
        int port = 5000;
        var server = new Server(port);

        Console.WriteLine("The server is running");

        while (true)
        {
            var request = server.WaitForRequest();
            
            // FIX: Create a fresh database context for every individual request
            using var database = new Database(); 
            
            try
            {
                if (request.Name == "getUser")
                {
                    var token = request.GetParams<string>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    request.Respond(user);
                }
                else if (request.Name == "signUp")
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
                    var user = database.Users.FirstOrDefault(u => u.Username == username && u.Password == password);
                    request.Respond(user?.Token);
                }
                else if (request.Name == "publishArticle")
                {
                    var (title, content, tags, token) = request.GetParams<(string, string, string, string)>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    if (user == null) { request.Respond(false); continue; }
                    var article = new Article(title, content, tags, user.Id);
                    database.Articles.Add(article);
                    database.SaveChanges();
                    request.Respond(true);
                }
                else if (request.Name == "toggleVote")
                {
                    var (token, articleId, voteValue) = request.GetParams<(string, int, int)>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    
                    if (user == null) { 
                        request.Respond(false); 
                        continue; 
                    }

                    var existingVote = database.Votes.FirstOrDefault(v => v.UserId == user.Id && v.ArticleId == articleId);

                    if (voteValue == 0) 
                    {
                        if (existingVote != null) database.Votes.Remove(existingVote);
                    } 
                    else 
                    {
                        bool isUpvote = (voteValue == 1);
                        if (existingVote != null) 
                        {
                            existingVote.IsUpvote = isUpvote;
                            // Explicitly mark as modified to ensure EF Core tracks it
                            database.Entry(existingVote).State = EntityState.Modified;
                        }
                        else 
                        {
                            database.Votes.Add(new Vote(user.Id, articleId, isUpvote));
                        }
                    }

                    try 
                    {
                        database.SaveChanges();
                        request.Respond(true);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"VOTE SAVE ERROR: {ex.Message}");
                        if (ex.InnerException != null) Console.WriteLine($"INNER: {ex.InnerException.Message}");
                        request.Respond(false);
                    }
                }
                else if (request.Name == "togglePin")
                {
                    var (token, articleId) = request.GetParams<(string, int)>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    if (user == null) { request.Respond(false); continue; }
                    var existingPin = database.Pins.FirstOrDefault(p => p.UserId == user.Id && p.ArticleId == articleId);
                    if (existingPin != null) { database.Pins.Remove(existingPin); }
                    else { database.Pins.Add(new Pin(user.Id, articleId)); }
                    database.SaveChanges();
                    request.Respond(true);
                }
                else if (request.Name == "getArticles")
                {
                    var token = request.GetParams<string>();

                    var user = database.Users.FirstOrDefault(u => u.Token == token);

                    int userId = user?.Id ?? 0;

                    var articles = database.Articles
                        .Include(a => a.User)
                        .OrderByDescending(a => a.Id)
                        .ToList();

                    var feedData = articles.Select(a =>
                    {
                        var articleVotes = database.Votes
                            .Where(v => v.ArticleId == a.Id)
                            .ToList();

                        int upvotes = articleVotes.Count(v => v.IsUpvote);
                        int downvotes = articleVotes.Count(v => !v.IsUpvote);

                        var userVoteObj = articleVotes
                            .FirstOrDefault(v => v.UserId == userId);

                        int userVote =
                            userVoteObj == null
                                ? 0
                                : (userVoteObj.IsUpvote ? 1 : -1);

                        bool isPinned = database.Pins.Any(p =>
                            p.UserId == userId &&
                            p.ArticleId == a.Id);

                        return new
                        {
                            a.Id,
                            a.Title,
                            a.Content,
                            a.Tags,
                            AuthorUsername = a.User.Username,
                            Upvotes = upvotes,
                            Downvotes = downvotes,
                            Score = upvotes - downvotes,
                            UserVote = userVote,
                            IsPinned = isPinned
                        };
                    }).ToList();
                    foreach (var item in feedData)
                    {
                        Console.WriteLine(
                            $"Article {item.Id} | Score={item.Score} | UserVote={item.UserVote}"
                        );
                    }
                    request.Respond(feedData);
                }
                else if (request.Name == "saveDraft")
                {
                    var (draftId, title, content, tags, token) = request.GetParams<(int?, string, string, string, string)>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    if (user == null) { request.Respond(false); continue; }

                    if (draftId.HasValue && draftId.Value > 0)
                    {
                        var existing = database.Drafts.FirstOrDefault(d => d.Id == draftId.Value && d.UserId == user.Id);
                        if (existing != null) {
                            existing.Title = title;
                            existing.Content = content;
                            existing.Tags = tags;
                        }
                    }
                    else
                    {
                        database.Drafts.Add(new Draft(user.Id, title, content, tags));
                    }
                    database.SaveChanges();
                    request.Respond(true);
                }
                else if (request.Name == "getDrafts")
                {
                    var token = request.GetParams<string>();
                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    if (user == null) { request.Respond(new List<Draft>()); continue; }

                    var drafts = database.Drafts.Where(d => d.UserId == user.Id).ToList();
                    request.Respond(drafts);
                }
                else if (request.Name == "deleteDraft")
                {
                    // Receive the data as a class, not a tuple
                    var data = request.GetParams<DeleteDraftRequest>(); 
                    var user = database.Users.FirstOrDefault(u => u.Token == data.Token);

                    if (user != null)
                    {
                        // Using data.DraftId instead of draftId.Value
                        var draft = database.Drafts.FirstOrDefault(d => d.Id == data.DraftId && d.UserId == user.Id);
                        if (draft != null) 
                        { 
                            database.Drafts.Remove(draft); 
                            database.SaveChanges(); 
                        }
                    }
                    request.Respond(true);
                }
                
            }
            catch (Exception ex) 
            { 
                request.SetStatusCode(500); 
                Log.WriteException(ex); 
            }
        }
    }
}
class User(string username, string password, string token)
{
    public int Id { get; set; }

    public string Username { get; set; } = username;
    public string Password { get; set; } = password;
    public string Token { get; set; } = token;
}

class Article(string title, string content, string tags, int userId)
{
    public int Id { get; set; }

    public string Title { get; set; } = title;
    public string Content { get; set; } = content;
    public string Tags { get; set; } = tags;

    public int UserId { get; set; } = userId;
    public User User { get; set; } = default!;
}

class Vote(int userId, int articleId, bool isUpvote)
{
    public int Id { get; set; }

    public int UserId { get; set; } = userId;
    public int ArticleId { get; set; } = articleId;

    public bool IsUpvote { get; set; } = isUpvote;

    public User User { get; set; } = default!;
    public Article Article { get; set; } = default!;
}

class Pin(int userId, int articleId)
{
    public int Id { get; set; }

    public int UserId { get; set; } = userId;
    public int ArticleId { get; set; } = articleId;

    public User User { get; set; } = default!;
    public Article Article { get; set; } = default!;
}
class Draft(int userId, string title, string content, string tags)
{
    public int Id { get; set; }
    public int UserId { get; set; } = userId;
    public string Title { get; set; } = title;
    public string Content { get; set; } = content;
    public string Tags { get; set; } = tags;
    public User User { get; set; } = default!;
}
class DeleteDraftRequest 
{
    public int DraftId { get; set; }
    public string Token { get; set; } = "";
}