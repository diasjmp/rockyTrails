package projetoAPDC.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
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
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.Transaction;
import com.google.gson.Gson;

import projetoAPDC.util.maps.Route;

@Path("/routes")
@Produces({ "application/json;charset=utf-8" })
public class Routes {
	
	private final Datastore datastore = (Datastore) DatastoreOptions.getDefaultInstance().getService();
	private final Gson g = new Gson();
	
	@POST
	@Path("/add")
	@Consumes({ "application/json" })
	public Response add(Route route) {
		if(!route.valid()) {
			return Response.status(Status.BAD_REQUEST).build();
		}else {
			Transaction txn = datastore.newTransaction();
			
			try {			
				Key routeKey = datastore.allocateId(datastore.newKeyFactory().setKind("Route").newKey());
				Entity routeEntity = Entity.newBuilder(routeKey)
						.set("lat", route.lat)
						.set("lng", route.lng)
						.set("name", route.name)
						.set("description", route.description)
						.set("meters", route.meters)
						.set("difficulty", route.difficulty)
						.set("directions",
						          StringValue.newBuilder(g.toJson(route.directions)).setExcludeFromIndexes(true).build())
						        
						.build();

					txn.put(routeEntity);
					txn.commit();
					return Response.ok(routeKey.getId()).build();
			} finally {
				if (txn.isActive()) {
					txn.rollback();
				}
			}
		}
	}
	
	/*
	 (lat, lng)
	 (x1,  y1)
	 (x2,  y2)
	 
	 1---------
	 |         |
	 |         |
	 |         |
	  ---------2
	 */
	//TODO - substituir por query
	@POST
	@Path("/list")
	public Response list(@QueryParam("x1")double x1, @QueryParam("y1")double y1, 
			@QueryParam("x2")double x2, @QueryParam("y2")double y2,
			@QueryParam("difmin")int difmin, @QueryParam("difmax")int difmax,
			@QueryParam("mtsmin")int mtsmin, @QueryParam("mtsmax")int mtsmax) {
	
		Query<Entity> query = Query.newEntityQueryBuilder().setKind("Route").build();
		QueryResults<Entity> routesQuery = this.datastore.run(query);
		
		List<Route> routes = new ArrayList<Route>();
        
		boolean f1 = validCoord(x1, y1, x2, y2);
		boolean f2 = difmin>0 && difmin<=5 && difmax>=difmin && difmax<=5;
		boolean f3 = mtsmin>0 && mtsmax>mtsmin;
		
        routesQuery.forEachRemaining(route -> {
        	Route nextRoute = new Route();
        	nextRoute.id 	      = route.getKey().getId();
        	nextRoute.lat         = route.getDouble("lat");
        	nextRoute.lng         = route.getDouble("lng");
        	nextRoute.name 		  = route.getString("name");
        	nextRoute.description = route.getString("description");
        	nextRoute.meters         = (int) route.getLong("meters");
        	nextRoute.difficulty  = (int) route.getLong("difficulty");
        	//nextRoute.directions = route.getString("directions");
        	
        	if(f1 && !(Double.compare(nextRoute.lat, x1) < 0 && Double.compare(nextRoute.lat, x2) > 0 &&
        			Double.compare(nextRoute.lng, y1)>0 && Double.compare(nextRoute.lng, y2)<0)) 
        		return;
        	
        	if(f2 && !(nextRoute.difficulty >= difmin && nextRoute.difficulty <= difmax))
        		return;
        	
        	if(f3 && !(nextRoute.meters >= mtsmin && nextRoute.meters <= mtsmax))
        		return;
        	
        	routes.add(nextRoute);
        });
        	
		return Response.ok(this.g.toJson(routes)).build();
	}

	private boolean validCoord(double x1, double y1, double x2, double y2) {
		
		return (Double.compare(x1, -90.0) >= 0 && Double.compare(x1, 90.0) <= 0 &&
				Double.compare(x2, -90.0) >= 0 && Double.compare(x2, x1) < 0 &&
				Double.compare(y1, -180.0) >= 0 && Double.compare(y1, 180.0) <= 0 &&
				Double.compare(y2, -180.) >= 0 && Double.compare(x2, 180.0) < 0
		);
	}
	
	@POST
	@Path("/directions/{routeID}")
	public Response getDirections(@PathParam("routeID") long routeID) {
		Key routeKey = datastore.newKeyFactory().setKind("Route").newKey(routeID);
		Entity route = this.datastore.get(routeKey);
		if (route == null) {
			return Response.status(Status.NOT_FOUND).build();
		}
		
		return Response.ok(route.getString("directions")).build();
		
	}
}
