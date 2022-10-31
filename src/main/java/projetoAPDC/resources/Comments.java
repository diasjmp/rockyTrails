package projetoAPDC.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.PathElement;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.StructuredQuery.OrderBy;
import com.google.cloud.datastore.Transaction;
import com.google.cloud.datastore.Value;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import projetoAPDC.util.authentication.AuthToken;
import projetoAPDC.util.comments.Comment;

@Path("/comments/{routeID}")
@Produces({ "application/json;charset=utf-8" })
public class Comments {
	
	private final Datastore datastore = (Datastore) DatastoreOptions.getDefaultInstance().getService();
	private final Gson g = new Gson();
	
	public Comments() {}
	
	@POST
	@Path("/add")
	public Response addComment(@PathParam("routeID") long routeID, String json) {
	    
		JsonObject object = JsonParser.parseString(json).getAsJsonObject();
	    AuthToken token = g.fromJson(object.get("token"), AuthToken.class);
	    String content = g.fromJson(object.get("comment"), String.class);
		
	    if(!token.isValid(datastore)) {
	    	return Response.status(Status.FORBIDDEN).entity("Invalid token.").build();
	    }
	    
	    Key routeKey = datastore.newKeyFactory().setKind("Route").newKey(routeID);
		Entity route = this.datastore.get(routeKey);
	    
		if(route == null) {
			return Response.status(Status.NOT_FOUND).entity("Not found route with that id.").build();
		}
	    Comment comment = new Comment(content, token.email);
	    
	   Transaction txn = datastore.newTransaction();
	    try {
	    	Key commentKey = datastore.allocateId(datastore.newKeyFactory()
	    			.addAncestor(PathElement.of("Route", routeID))
	    			.setKind("Comment")
	    			.newKey());
	    	
	    	Entity commentEntity = Entity.newBuilder(commentKey)
	    			.set("author", comment.author)
					.set("content", comment.content)
					.set("likes", comment.likes)
					.set("reports", comment.reports)
					.set("creationDate", comment.creationDate)
					.set("usersLikes", convertToValueList(comment.usersLikes))
					.set("usersReports", convertToValueList(comment.usersReports))
					.build();
	    	
	    	txn.put(commentEntity);
			txn.commit();
	    } finally {
			if (txn.isActive()) {
				txn.rollback();
			}
		}
		return Response.status(Status.OK).build();
	}
	
	@POST
	@Path("/list")
	public Response listComments(@QueryParam("orderBy")String orderBy, AuthToken token) {
		if(!token.isValid(datastore))
			return Response.status(Status.FORBIDDEN).entity("Invalid token.").build();
		
		OrderBy order;
		
		switch(orderBy==null?"":orderBy) {
			case("likesAsc"):
				order = OrderBy.asc("likes");break;
			case("creationAsc"):
				order = OrderBy.asc("creationDate");break;
			case("creationDesc"):
				order = OrderBy.desc("creationDate");break;
			default://likes desc
				order = OrderBy.desc("likes");break;
		
		}
		
		Query<Entity> query = Query.newEntityQueryBuilder()
								.setKind("Comment")
								.setOrderBy(order)
								.build();
		QueryResults<Entity> commentsQuery = this.datastore.run(query);
		
		
		List<Comment> comments = new ArrayList<Comment>();
		commentsQuery.forEachRemaining(comment -> {
			Comment nextComment = new Comment();
			nextComment.commentID = comment.getKey().getId();
			nextComment.author = comment.getString("author");
			nextComment.content = comment.getString("content");
			nextComment.likes = (int) comment.getLong("likes");
			nextComment.creationDate = comment.getLong("creationDate");
			comments.add(nextComment);
		});
		
		return Response.status(Status.OK).entity(this.g.toJson(comments)).build();
	}
	
	@POST
	@Path("/like/{commentID}")
	//TODO - melhorar datastore, ?usersLiked ñ indexado?
	public Response like(@PathParam("routeID") long routeID, 
							@PathParam("commentID") long commentID, AuthToken token) {
		if(!token.isValid(datastore))
			return Response.status(Status.FORBIDDEN).entity("Invalid token.").build();
		
		//Se o token existe o user tambem existe, em situação normal
		
		boolean liked;
		
		Key commentKey = datastore.newKeyFactory()
				.addAncestor(PathElement.of("Route", routeID))
				.setKind("Comment")
				.newKey(commentID);
		
		Entity commentEntity = this.datastore.get(commentKey);
		
		if(commentEntity == null)
			return Response.status(Status.NOT_FOUND).entity("Não existe comentário com commentID: "+commentID).build();
		
		Transaction txn = datastore.newTransaction();
		    try {
		    	long likes = commentEntity.getLong("likes");
		    	List<String> usersLikes = new ArrayList<String>();
		    	usersLikes = convertFromValueList(commentEntity.getList("usersLikes"));
		    	
		    	if(usersLikes.contains(token.email)) {
		    		likes--;
		    		usersLikes.remove(token.email);
		    		liked = false;
		    	}else {
		    		likes++;
		    		usersLikes.add(token.email);
		    		liked = true;
		    	}
		    	
		    	Entity updComment = Entity.newBuilder(commentKey)
		    			.set("author", commentEntity.getString("author"))
						.set("content", commentEntity.getString("content"))
						.set("likes", likes)
						.set("reports", commentEntity.getLong("reports"))
						.set("creationDate", commentEntity.getLong("creationDate"))
						.set("usersLikes", convertToValueList(usersLikes))
						.set("usersReports", commentEntity.getList("usersReports"))
						.build();
		    	
		    	txn.put(updComment);
		    	txn.commit();
		    } finally {
				if (txn.isActive()) {
					txn.rollback();
				}
			}
		
		return Response.status(Status.OK).entity(liked).build();
	}
	
	@POST
	@Path("/report/{commentID}")
	//TODO - melhorar datastore, ?usersLiked ñ indexado?
	public Response report(@PathParam("routeID") long routeID, 
							@PathParam("commentID") long commentID, AuthToken token) {
		if(!token.isValid(datastore))
			return Response.status(Status.FORBIDDEN).entity("Invalid token.").build();
		
		//Se o token existe o user tambem existe, em situação normal
		
		Key commentKey = datastore.newKeyFactory()
				.addAncestor(PathElement.of("Route", routeID))
				.setKind("Comment")
				.newKey(commentID);
		
		Entity commentEntity = this.datastore.get(commentKey);
		
		if(commentEntity == null)
			return Response.status(Status.NOT_FOUND).entity("Não existe comentário com commentID: "+commentID).build();
		
		Transaction txn = datastore.newTransaction();
		    try {
		    	List<String> usersReports = new ArrayList<String>();
		    	usersReports = convertFromValueList(commentEntity.getList("usersReports"));
		    	
		    	if(usersReports.contains(token.email)) {
		    		return Response.status(Status.FORBIDDEN).entity("Already reported").build();
		    	}else {
		    		usersReports.add(token.email);
		    	}
		    	
		    	Entity updComment = Entity.newBuilder(commentKey)
		    			.set("author", commentEntity.getString("author"))
						.set("content", commentEntity.getString("content"))
						.set("likes", commentEntity.getLong("likes"))
						.set("reports", commentEntity.getLong("reports")+1L)
						.set("creationDate", commentEntity.getLong("creationDate"))
						.set("usersLikes", commentEntity.getList("usersLikes"))
						.set("usersReports", convertToValueList(usersReports))
						.build();
		    	
		    	txn.put(updComment);
		    	txn.commit();
		    } finally {
				if (txn.isActive()) {
					txn.rollback();
				}
			}
		
		return Response.status(Status.OK).build();
		
	}
	
	private List<String> convertFromValueList(List<Value<String>> list){
		List<String> result = new ArrayList<String>();
		for(Value<String> v : list) {
			result.add(v.get());
		}
	
		return result;
	}
	
	private List<Value<String>> convertToValueList(List<String> list) {
	    List<Value<String>> result = new ArrayList<Value<String>>();
	    for (String s : list) {
	        result.add(StringValue.of(s));
	    }
	    return result;
	}

}
