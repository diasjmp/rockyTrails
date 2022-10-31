package projetoAPDC.util.authentication;

public class UserData {
	public String email;
	public String password;

	public String username;
	public String confirmation;
	
	public UserData() {}
	
	//TODO - test email
	public boolean validRegistration() {
		return password.equals(confirmation);
	}
}
