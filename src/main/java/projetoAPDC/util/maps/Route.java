package projetoAPDC.util.maps;

public class Route {
	public long id;
	public double lat;
	public double lng;
	public String name;
	public String description;
	public int meters;
	//public List<String> tags;
	public int difficulty;
	public Object directions;
	
	public Route() {}

	public Route(double lat, double lng, String name, String description, int meters,
			int difficulty, Object directionsJSON) {
		this.lat = lat;
		this.lng = lng;
		this.name = name;
		this.description = description;
		this.meters = meters;
		this.difficulty = difficulty;
		this.directions = directionsJSON;
	}

	public boolean valid() {
		return (name != null && description != null && directions != null && difficulty > 0 && difficulty < 6);
	}
	
	
	

}
