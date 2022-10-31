package projetoAPDC.util.comments;
import java.util.ArrayList;
import java.util.List;

import com.google.cloud.datastore.Value;

public class Comment {
	public static final int MAX_REPORTS = 5;
	
	public long commentID;
	//TODO - author não pode ser email
	public String author;
	public String content;
	public int likes;
	public int reports;
	public long creationDate;
	public List<String> usersLikes;
	public List<String> usersReports;
	
	public Comment() {};
	
	public Comment(String content, String author) {
		this.author = author;
		this.content = content;
		likes = 0;
		reports = 0;
		creationDate = System.currentTimeMillis();
		usersLikes = new ArrayList<String>();
		usersReports = new ArrayList<String>();
	}
	
	public boolean maxReports() {
		return reports > MAX_REPORTS;
	}
}

